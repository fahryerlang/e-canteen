import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET single canteen
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const canteen = await prisma.canteen.findUnique({
      where: { id: parseInt(id) },
      include: {
        menus: { where: { available: true }, orderBy: { name: "asc" } },
        users: { where: { role: "SELLER" }, select: { id: true, name: true, email: true } },
      },
    });
    if (!canteen) return NextResponse.json({ error: "Kantin tidak ditemukan" }, { status: 404 });
    return NextResponse.json(canteen);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kantin" }, { status: 500 });
  }
}

// PUT update canteen (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, description, isActive } = await request.json();
    const canteen = await prisma.canteen.update({
      where: { id: parseInt(id) },
      data: { name, description, isActive },
    });
    return NextResponse.json(canteen);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate kantin" }, { status: 500 });
  }
}

// DELETE canteen (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.canteen.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Kantin berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kantin" }, { status: 500 });
  }
}
