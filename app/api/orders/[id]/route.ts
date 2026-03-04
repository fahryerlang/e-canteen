import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT update order status (admin or seller)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    if (!["DIPROSES", "SIAP_DIAMBIL", "SELESAI"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    // For sellers, verify the order contains their canteen's items
    if (session.role === "SELLER" && session.canteenId) {
      const orderCheck = await prisma.order.findFirst({
        where: { id: orderId, items: { some: { menu: { canteenId: session.canteenId } } } },
      });
      if (!orderCheck) {
        return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { menu: { select: { name: true } } },
        },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengupdate status pesanan" },
      { status: 500 }
    );
  }
}
