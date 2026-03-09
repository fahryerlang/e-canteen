import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = { role: "SELLER" };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> =
      sort === "balance-high" ? { balance: "desc" } :
      sort === "balance-low" ? { balance: "asc" } :
      sort === "name" ? { name: "asc" } :
      { createdAt: "desc" };

    const sellers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        canteenId: true,
        canteen: { select: { id: true, name: true } },
        createdAt: true,
        _count: { select: { withdrawals: true } },
      },
      orderBy,
    });

    // Count menus per seller's canteen
    const canteenIds = sellers.map((s) => s.canteenId).filter((id): id is number => id !== null);
    const menuCounts = canteenIds.length > 0
      ? await prisma.menu.groupBy({ by: ["canteenId"], where: { canteenId: { in: canteenIds } }, _count: true })
      : [];
    const menuCountMap = new Map(menuCounts.map((m) => [m.canteenId, m._count]));

    const result = sellers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      balance: s.balance,
      canteen: s.canteen,
      createdAt: s.createdAt,
      totalWithdrawals: s._count.withdrawals,
      totalMenus: s.canteenId ? (menuCountMap.get(s.canteenId) || 0) : 0,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data penjual" }, { status: 500 });
  }
}
