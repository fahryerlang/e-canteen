import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET: Seller's withdrawal history
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { sellerId: session.id },
      orderBy: { createdAt: "desc" },
    });

    // Calculate seller revenue (total from completed orders for their canteen)
    const sellerRevenue = await prisma.orderItem.aggregate({
      _sum: { unitPrice: true },
      where: {
        menu: { canteenId: session.canteenId! },
        order: { status: "SELESAI" },
      },
    });

    // More accurate: sum of (unitPrice * quantity)
    const completedItems = await prisma.orderItem.findMany({
      where: {
        menu: { canteenId: session.canteenId! },
        order: { status: "SELESAI" },
      },
      select: { unitPrice: true, quantity: true },
    });

    const totalRevenue = completedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const totalWithdrawn = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: {
        sellerId: session.id,
        status: "APPROVED",
      },
    });

    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: {
        sellerId: session.id,
        status: "PENDING",
      },
    });

    const withdrawn = totalWithdrawn._sum.amount || 0;
    const pending = pendingWithdrawals._sum.amount || 0;
    const availableBalance = totalRevenue - withdrawn - pending;

    return NextResponse.json({
      withdrawals,
      summary: {
        totalRevenue,
        totalWithdrawn: withdrawn,
        pendingAmount: pending,
        availableBalance: Math.max(0, availableBalance),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data setoran" },
      { status: 500 }
    );
  }
}

// POST: Create a new withdrawal request
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canteenId) {
      return NextResponse.json(
        { error: "Akun tidak terhubung ke kantin" },
        { status: 400 }
      );
    }

    const { amount, note } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah setoran harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Calculate available balance
    const completedItems = await prisma.orderItem.findMany({
      where: {
        menu: { canteenId: session.canteenId },
        order: { status: "SELESAI" },
      },
      select: { unitPrice: true, quantity: true },
    });

    const totalRevenue = completedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const totalWithdrawn = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { sellerId: session.id, status: "APPROVED" },
    });

    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { sellerId: session.id, status: "PENDING" },
    });

    const withdrawn = totalWithdrawn._sum.amount || 0;
    const pending = pendingWithdrawals._sum.amount || 0;
    const availableBalance = totalRevenue - withdrawn - pending;

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Saldo tidak cukup. Saldo tersedia: Rp ${Math.max(0, availableBalance).toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        sellerId: session.id,
        amount,
        note: note || null,
      },
    });

    return NextResponse.json(withdrawal, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat permintaan setoran" },
      { status: 500 }
    );
  }
}
