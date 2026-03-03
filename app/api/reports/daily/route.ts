import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET daily report (admin only)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        items: {
          include: {
            menu: { select: { name: true } },
          },
        },
      },
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;

    // Calculate per-menu breakdown
    const menuBreakdown: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.menuId.toString();
        if (!menuBreakdown[key]) {
          menuBreakdown[key] = {
            name: item.menu.name,
            quantity: 0,
            revenue: 0,
          };
        }
        menuBreakdown[key].quantity += item.quantity;
        menuBreakdown[key].revenue += item.unitPrice * item.quantity;
      }
    }

    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      totalRevenue,
      totalOrders,
      menuBreakdown: Object.values(menuBreakdown),
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil laporan" },
      { status: 500 }
    );
  }
}
