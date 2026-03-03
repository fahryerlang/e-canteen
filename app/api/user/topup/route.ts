import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST top up balance
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah top up harus lebih dari 0" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { balance: { increment: parseFloat(amount) } },
      select: { id: true, name: true, balance: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Gagal top up saldo" },
      { status: 500 }
    );
  }
}
