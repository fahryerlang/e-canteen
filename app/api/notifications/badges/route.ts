import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET badge counts for sidebar notifications
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "ADMIN") {
      const [pendingOrders, pendingTopups, pendingWithdrawals] = await Promise.all([
        prisma.order.count({ where: { status: "DIPROSES" } }),
        prisma.transaction.count({ where: { type: "TOPUP", status: "PENDING" } }),
        prisma.withdrawal.count({ where: { status: "PENDING" } }),
      ]);

      return NextResponse.json({
        "/admin/orders": pendingOrders,
        "/admin/topup": pendingTopups,
        "/admin/withdrawals": pendingWithdrawals,
      });
    }

    if (session.role === "SELLER" && session.canteenId) {
      const pendingOrders = await prisma.order.count({
        where: {
          status: "DIPROSES",
          items: { some: { menu: { canteenId: session.canteenId } } },
        },
      });

      return NextResponse.json({
        "/seller/orders": pendingOrders,
      });
    }

    // USER - count active orders (DIPROSES or SIAP_DIAMBIL)
    if (session.role === "USER") {
      const activeOrders = await prisma.order.count({
        where: {
          userId: session.id,
          status: { in: ["DIPROSES", "SIAP_DIAMBIL"] },
        },
      });

      return NextResponse.json({
        "/user/orders": activeOrders,
      });
    }

    return NextResponse.json({});
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
