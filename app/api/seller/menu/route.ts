import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET seller's own menus
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canteenId) {
      return NextResponse.json({ error: "Akun penjual tidak terhubung ke kantin" }, { status: 400 });
    }

    const menus = await prisma.menu.findMany({
      where: { canteenId: session.canteenId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(menus);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil menu" }, { status: 500 });
  }
}

// POST create menu item (seller only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canteenId) {
      return NextResponse.json({ error: "Akun penjual tidak terhubung ke kantin" }, { status: 400 });
    }

    const { name, price, image, available, category, description } = await request.json();
    if (!name || price === undefined) {
      return NextResponse.json({ error: "Nama dan harga wajib diisi" }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseFloat(price),
        image: image || null,
        available: available !== undefined ? available : true,
        category: category || "MAKANAN",
        description: description || null,
        canteenId: session.canteenId,
      },
    });
    return NextResponse.json(menu, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat menu" }, { status: 500 });
  }
}
