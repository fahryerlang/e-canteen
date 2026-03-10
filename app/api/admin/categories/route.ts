import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all categories (public - needed by menu pages)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kategori" }, { status: 500 });
  }
}

// POST create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const slug = name.trim().toUpperCase().replace(/\s+/g, "_");

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Kategori dengan nama tersebut sudah ada" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}
