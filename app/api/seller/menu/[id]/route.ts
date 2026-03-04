import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT update menu item (seller only, own item)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const menuId = parseInt(id);

    // Verify menu belongs to seller's canteen
    const existing = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!existing || existing.canteenId !== session.canteenId) {
      return NextResponse.json({ error: "Menu tidak ditemukan atau bukan milik kantin Anda" }, { status: 403 });
    }

    const { name, price, image, available, category, description } = await request.json();
    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: name ?? existing.name,
        price: price !== undefined ? parseFloat(price) : existing.price,
        image: image !== undefined ? image : existing.image,
        available: available !== undefined ? available : existing.available,
        category: category ?? existing.category,
        description: description !== undefined ? description : existing.description,
      },
    });
    return NextResponse.json(menu);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate menu" }, { status: 500 });
  }
}

// DELETE menu item (seller only, own item)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const menuId = parseInt(id);

    const existing = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!existing || existing.canteenId !== session.canteenId) {
      return NextResponse.json({ error: "Menu tidak ditemukan atau bukan milik kantin Anda" }, { status: 403 });
    }

    await prisma.menu.delete({ where: { id: menuId } });
    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus menu" }, { status: 500 });
  }
}
