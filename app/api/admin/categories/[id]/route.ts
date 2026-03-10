import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT update category (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const slug = name.trim().toUpperCase().replace(/\s+/g, "_");

    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id: parseInt(id) } },
    });
    if (existing) {
      return NextResponse.json({ error: "Kategori dengan nama tersebut sudah ada" }, { status: 409 });
    }

    // Get old slug to update menus
    const oldCategory = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!oldCategory) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    // Update category and related menus in transaction
    const [category] = await prisma.$transaction([
      prisma.category.update({
        where: { id: parseInt(id) },
        data: { name: name.trim(), slug },
      }),
      prisma.menu.updateMany({
        where: { category: oldCategory.slug },
        data: { category: slug },
      }),
    ]);

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate kategori" }, { status: 500 });
  }
}

// DELETE category (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if any menus use this category
    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const menuCount = await prisma.menu.count({ where: { category: category.slug } });
    if (menuCount > 0) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus kategori yang masih digunakan oleh ${menuCount} menu` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
