import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET orders that contain items from seller's canteen
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canteenId) {
      return NextResponse.json({ error: "Akun penjual tidak terhubung ke kantin" }, { status: 400 });
    }

    // Fetch orders that have at least one item from this canteen
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { menu: { canteenId: session.canteenId } },
        },
      },
      include: {
        items: {
          where: { menu: { canteenId: session.canteenId } },
          include: {
            menu: { select: { name: true, image: true, canteenId: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}
