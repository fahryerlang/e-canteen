import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET reviews for a specific menu, or all reviews by the current user
// ?menuId=1 or ?orderId=5
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get("menuId");
    const orderId = searchParams.get("orderId");

    const where: Record<string, unknown> = {};
    if (menuId) where.menuId = parseInt(menuId);
    if (orderId) where.orderId = parseInt(orderId);

    const session = await getSession();
    if (session) where.userId = session.id;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        menu: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil ulasan" }, { status: 500 });
  }
}

// POST create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { menuId, orderId, rating, comment } = await request.json();

    if (!menuId || !orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Data tidak lengkap (menuId, orderId, rating 1-5)" }, { status: 400 });
    }

    // Verify the order belongs to the user and is completed
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.id, status: "SELESAI" },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan atau belum selesai" }, { status: 400 });
    }

    // Verify the menu was part of this order
    const hasMenu = order.items.some((item) => item.menuId === menuId);
    if (!hasMenu) {
      return NextResponse.json({ error: "Menu ini tidak ada dalam pesanan tersebut" }, { status: 400 });
    }

    // Check if review already exists
    const existing = await prisma.review.findUnique({
      where: { userId_menuId_orderId: { userId: session.id, menuId, orderId } },
    });

    if (existing) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment || null },
      });
      return NextResponse.json(review);
    }

    const review = await prisma.review.create({
      data: {
        userId: session.id,
        menuId,
        orderId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan ulasan" }, { status: 500 });
  }
}
