import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT approve/reject topup request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const txId = parseInt(id);
    const body = await request.json();
    const { action } = body; // "approve" or "reject"

    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    if (!tx || tx.type !== "TOPUP") {
      return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 });
    }
    if (tx.status !== "PENDING") {
      return NextResponse.json({ error: "Permintaan sudah diproses" }, { status: 400 });
    }

    if (action === "approve") {
      // Approve: update status + add balance
      await prisma.$transaction(async (ptx) => {
        await ptx.transaction.update({
          where: { id: txId },
          data: { status: "APPROVED" },
        });
        await ptx.user.update({
          where: { id: tx.userId },
          data: { balance: { increment: tx.amount } },
        });
      });
      return NextResponse.json({ success: true, message: "Top-up disetujui" });
    } else if (action === "reject") {
      await prisma.transaction.update({
        where: { id: txId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "Top-up ditolak" });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 500 });
  }
}
