import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET seller's sales report
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER" || !session.canteenId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, unknown> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }

    // Get all orders containing items from this seller's canteen
    const orders = await prisma.order.findMany({
      where: {
        status: "SELESAI",
        ...(from || to ? { createdAt: dateFilter } : {}),
        items: {
          some: {
            menu: { canteenId: session.canteenId },
          },
        },
      },
      include: {
        items: {
          where: { menu: { canteenId: session.canteenId } },
          include: { menu: { select: { id: true, name: true, category: true, price: true } } },
        },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    let totalRevenue = 0;
    const menuStats: Record<number, { name: string; category: string; qty: number; revenue: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const rev = item.unitPrice * item.quantity;
        totalRevenue += rev;
        if (!menuStats[item.menuId]) {
          menuStats[item.menuId] = { name: item.menu.name, category: item.menu.category, qty: 0, revenue: 0 };
        }
        menuStats[item.menuId].qty += item.quantity;
        menuStats[item.menuId].revenue += rev;
      }
    }

    const menuBreakdown = Object.entries(menuStats)
      .map(([id, s]) => ({ menuId: parseInt(id), ...s }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily revenue for chart
    const dailyMap: Record<string, number> = {};
    for (const order of orders) {
      const day = order.createdAt.toISOString().slice(0, 10);
      for (const item of order.items) {
        dailyMap[day] = (dailyMap[day] || 0) + item.unitPrice * item.quantity;
      }
    }
    const dailyRevenue = Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalOrders: orders.length,
      totalRevenue,
      totalItemsSold: Object.values(menuStats).reduce((a, s) => a + s.qty, 0),
      menuBreakdown,
      dailyRevenue,
      orders: orders.map((o) => ({
        id: o.id,
        customer: o.user.name,
        total: o.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0),
        itemCount: o.items.reduce((a, i) => a + i.quantity, 0),
        createdAt: o.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil laporan" }, { status: 500 });
  }
}
