import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET daily report (admin only), optional ?date=2026-03-04 or ?from=2026-03-01&to=2026-03-04
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let startDate: Date;
    let endDate: Date;

    if (fromParam && toParam) {
      startDate = new Date(fromParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(toParam);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateParam) {
      startDate = new Date(dateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            menu: { select: { name: true, canteenId: true, canteen: { select: { name: true } } } },
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
      date: startDate.toISOString().split("T")[0],
      dateTo: endDate.toISOString().split("T")[0],
      totalRevenue,
      totalOrders,
      menuBreakdown: Object.values(menuBreakdown).sort((a, b) => b.revenue - a.revenue),
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil laporan" },
      { status: 500 }
    );
  }
}
