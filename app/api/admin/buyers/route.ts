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

    const where: Record<string, unknown> = { role: "USER" };
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

    const buyers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true, favorites: true } },
        orders: {
          select: { totalPrice: true },
        },
      },
      orderBy,
    });

    const result = buyers.map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      balance: b.balance,
      createdAt: b.createdAt,
      totalOrders: b._count.orders,
      totalReviews: b._count.reviews,
      totalFavorites: b._count.favorites,
      totalSpent: b.orders.reduce((sum, o) => sum + o.totalPrice, 0),
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data pembeli" }, { status: 500 });
  }
}
