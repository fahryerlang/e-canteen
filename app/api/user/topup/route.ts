import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST request top up (creates PENDING request for admin approval)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah top up harus lebih dari 0" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.id,
        type: "TOPUP",
        amount: parseFloat(amount),
        note: note || "Permintaan top up saldo",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      message: "Permintaan top-up berhasil dikirim. Menunggu persetujuan admin.",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengirim permintaan top up" },
      { status: 500 }
    );
  }
}
