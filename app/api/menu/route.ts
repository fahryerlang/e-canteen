import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all menus (public), optional ?canteenId=1 filter, ?search=nasi, ?category=MAKANAN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const canteenIdParam = searchParams.get("canteenId");
    const searchParam = searchParams.get("search");
    const categoryParam = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (canteenIdParam) where.canteenId = parseInt(canteenIdParam);
    if (categoryParam) where.category = categoryParam;
    if (searchParam) where.name = { contains: searchParam };

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        canteen: { select: { id: true, name: true } },
        reviews: { select: { rating: true } },
      },
    });

    // Attach average rating to each menu
    const menusWithRating = menus.map((m) => {
      const ratings = m.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const { reviews, ...rest } = m;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, totalReviews: ratings.length };
    });

    return NextResponse.json(menusWithRating);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

// POST create menu (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, image, available, canteenId } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Nama dan harga wajib diisi" },
        { status: 400 }
      );
    }

    if (!canteenId) {
      return NextResponse.json(
        { error: "Kantin wajib dipilih" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseFloat(price),
        image: image || null,
        available: available !== undefined ? available : true,
        canteenId: parseInt(canteenId),
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat menu" },
      { status: 500 }
    );
  }
}
