import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    const buyer = await prisma.user.findFirst({
      where: { id: userId, role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true, favorites: true } },
        orders: {
          select: { id: true, totalPrice: true, status: true, createdAt: true, pickupTime: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        transactions: {
          select: { id: true, type: true, amount: true, status: true, createdAt: true, note: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ error: "Pembeli tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil detail pembeli" }, { status: 500 });
  }
}

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
    const userId = parseInt(id);
    const body = await request.json();
    const { name, email, balance } = body;

    const existing = await prisma.user.findFirst({ where: { id: userId, role: "USER" } });
    if (!existing) {
      return NextResponse.json({ error: "Pembeli tidak ditemukan" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (balance !== undefined && typeof balance === "number" && balance >= 0) data.balance = balance;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, balance: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate pembeli" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    const existing = await prisma.user.findFirst({ where: { id: userId, role: "USER" } });
    if (!existing) {
      return NextResponse.json({ error: "Pembeli tidak ditemukan" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus pembeli" }, { status: 500 });
  }
}
