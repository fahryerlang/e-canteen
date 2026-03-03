import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all menus (public)
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(menus);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

// POST create menu (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, image, available } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Nama dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        price: parseFloat(price),
        image: image || null,
        available: available !== undefined ? available : true,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat menu" },
      { status: 500 }
    );
  }
}
