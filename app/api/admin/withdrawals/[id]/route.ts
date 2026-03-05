import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT: Approve or reject a withdrawal request (admin only)
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
    const withdrawalId = parseInt(id);
    const body = await request.json();
    const { action } = body; // "approve" or "reject"

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Permintaan setoran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { error: "Permintaan sudah diproses" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({
        success: true,
        message: "Setoran disetujui",
      });
    } else if (action === "reject") {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({
        success: true,
        message: "Setoran ditolak",
      });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses permintaan setoran" },
      { status: 500 }
    );
  }
}
