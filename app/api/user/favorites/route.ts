import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET user favorites
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      include: {
        menu: {
          include: {
            canteen: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = favorites.map((f) => ({
      id: f.id,
      menuId: f.menuId,
      createdAt: f.createdAt,
      menu: {
        ...f.menu,
        avgRating:
          f.menu.reviews.length > 0
            ? Math.round((f.menu.reviews.reduce((a, r) => a + r.rating, 0) / f.menu.reviews.length) * 10) / 10
            : 0,
        totalReviews: f.menu.reviews.length,
      },
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil favorit" }, { status: 500 });
  }
}

// POST toggle favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { menuId } = await request.json();
    if (!menuId) {
      return NextResponse.json({ error: "menuId wajib diisi" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_menuId: { userId: session.id, menuId: parseInt(menuId) } },
    });

    if (existing) {
      // Remove
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      // Add
      await prisma.favorite.create({
        data: { userId: session.id, menuId: parseInt(menuId) },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch {
    return NextResponse.json({ error: "Gagal toggle favorit" }, { status: 500 });
  }
}
