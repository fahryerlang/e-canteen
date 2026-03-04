import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canteenId) {
      return NextResponse.json({ error: "Akun penjual tidak terhubung ke kantin" }, { status: 400 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Orders today that contain items from this canteen
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        items: { some: { menu: { canteenId: session.canteenId } } },
      },
      include: {
        items: {
          where: { menu: { canteenId: session.canteenId } },
          include: { menu: { select: { name: true } } },
        },
      },
    });

    // calculate revenue from only seller's items (not the full order total)
    let totalRevenue = 0;
    const menuQtyMap: Record<string, { quantity: number; revenue: number }> = {};

    for (const order of todayOrders) {
      for (const item of order.items) {
        const subtotal = item.unitPrice * item.quantity;
        totalRevenue += subtotal;
        const menuName = item.menu.name;
        if (!menuQtyMap[menuName]) menuQtyMap[menuName] = { quantity: 0, revenue: 0 };
        menuQtyMap[menuName].quantity += item.quantity;
        menuQtyMap[menuName].revenue += subtotal;
      }
    }

    const menuBreakdown = Object.entries(menuQtyMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.quantity - a.quantity);

    const activeOrders = await prisma.order.count({
      where: {
        status: { not: "SELESAI" },
        items: { some: { menu: { canteenId: session.canteenId } } },
      },
    });

    const totalMenus = await prisma.menu.count({ where: { canteenId: session.canteenId } });

    const canteen = await prisma.canteen.findUnique({
      where: { id: session.canteenId },
      select: { name: true },
    });

    return NextResponse.json({
      canteenName: canteen?.name ?? "",
      totalRevenue,
      totalOrders: todayOrders.length,
      activeOrders,
      totalMenus,
      menuBreakdown,
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}
