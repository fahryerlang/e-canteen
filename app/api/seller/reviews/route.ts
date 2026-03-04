import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET reviews for seller's menu items
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER" || !session.canteenId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        menu: { canteenId: session.canteenId },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        menu: { select: { id: true, name: true, category: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0;
    const ratingDist = [0, 0, 0, 0, 0]; // 1-5 star counts
    for (const r of reviews) {
      ratingDist[r.rating - 1]++;
    }

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: ratingDist,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil ulasan" }, { status: 500 });
  }
}
