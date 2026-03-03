import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT update menu
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
    const body = await request.json();
    const { name, price, image, available } = body;

    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(image !== undefined && { image }),
        ...(available !== undefined && { available }),
      },
    });

    return NextResponse.json(menu);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengupdate menu" },
      { status: 500 }
    );
  }
}

// DELETE menu
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

    await prisma.menu.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus menu" },
      { status: 500 }
    );
  }
}
