import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT – seller updates status of an order
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canteenId) {
      return NextResponse.json({ error: "Akun penjual tidak terhubung ke kantin" }, { status: 400 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const { status } = await request.json();

    const validStatuses = ["DIPROSES", "SIAP_DIAMBIL", "SELESAI"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    // Ensure order has items from this seller's canteen
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: { some: { menu: { canteenId: session.canteenId } } },
      },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate status pesanan" }, { status: 500 });
  }
}
