import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all canteens (public – buyers need canteen list)
export async function GET() {
  try {
    const canteens = await prisma.canteen.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: { select: { menus: true, users: true } },
        menus: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, price: true, available: true, image: true },
        },
      },
    });
    return NextResponse.json(canteens);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kantin" }, { status: 500 });
  }
}

// POST create canteen (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Nama kantin wajib diisi" }, { status: 400 });
    }

    const canteen = await prisma.canteen.create({ data: { name, description } });
    return NextResponse.json(canteen, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat kantin" }, { status: 500 });
  }
}
