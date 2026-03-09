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

    const seller = await prisma.user.findFirst({
      where: { id: userId, role: "SELLER" },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        canteenId: true,
        canteen: { select: { id: true, name: true } },
        createdAt: true,
        _count: { select: { withdrawals: true } },
        withdrawals: {
          select: { id: true, amount: true, status: true, note: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Penjual tidak ditemukan" }, { status: 404 });
    }

    // Get menus for the seller's canteen
    const menus = seller.canteenId
      ? await prisma.menu.findMany({
          where: { canteenId: seller.canteenId },
          select: { id: true, name: true, price: true, available: true, category: true },
          orderBy: { name: "asc" },
          take: 10,
        })
      : [];

    return NextResponse.json({ ...seller, menus });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil detail penjual" }, { status: 500 });
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
    const { name, email, canteenId } = body;

    const existing = await prisma.user.findFirst({ where: { id: userId, role: "SELLER" } });
    if (!existing) {
      return NextResponse.json({ error: "Penjual tidak ditemukan" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (canteenId !== undefined) data.canteenId = canteenId ? parseInt(canteenId) : null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, canteenId: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate penjual" }, { status: 500 });
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

    const existing = await prisma.user.findFirst({ where: { id: userId, role: "SELLER" } });
    if (!existing) {
      return NextResponse.json({ error: "Penjual tidak ditemukan" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus penjual" }, { status: 500 });
  }
}
