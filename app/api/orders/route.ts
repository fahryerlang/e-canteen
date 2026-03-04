import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET orders - User sees own orders, Admin/Seller sees all / their canteen
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where = {};
    if (session.role === "USER") {
      where = { userId: session.id };
    } else if (session.role === "SELLER" && session.canteenId) {
      where = { items: { some: { menu: { canteenId: session.canteenId } } } };
    }
    // ADMIN: no filter, sees all

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menu: { select: { name: true, image: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

// POST create order (user only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pickupTime, items } = body;

    if (!pickupTime || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Waktu pengambilan dan item wajib diisi" },
        { status: 400 }
      );
    }

    // Validate pickup time
    if (!["ISTIRAHAT_1", "ISTIRAHAT_2"].includes(pickupTime)) {
      return NextResponse.json(
        { error: "Waktu pengambilan tidak valid" },
        { status: 400 }
      );
    }

    // Fetch menu items to verify prices and availability
    const menuIds = items.map((item: { menuId: number }) => item.menuId);
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds } },
    });

    const menuMap = new Map(menus.map((m) => [m.id, m]));

    // Validate all items are available
    for (const item of items) {
      const menu = menuMap.get(item.menuId);
      if (!menu) {
        return NextResponse.json(
          { error: `Menu dengan ID ${item.menuId} tidak ditemukan` },
          { status: 400 }
        );
      }
      if (!menu.available) {
        return NextResponse.json(
          { error: `Menu "${menu.name}" sedang tidak tersedia` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    let totalPrice = 0;
    const orderItems = items.map(
      (item: { menuId: number; quantity: number }) => {
        const menu = menuMap.get(item.menuId)!;
        const subtotal = menu.price * item.quantity;
        totalPrice += subtotal;
        return {
          menuId: item.menuId,
          quantity: item.quantity,
          unitPrice: menu.price,
        };
      }
    );

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user || user.balance < totalPrice) {
      return NextResponse.json(
        { error: "Saldo tidak mencukupi" },
        { status: 400 }
      );
    }

    // Create order and deduct balance in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: session.id },
        data: { balance: { decrement: totalPrice } },
      });

      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          userId: session.id,
          pickupTime,
          totalPrice,
          status: "DIPROSES",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: { menu: { select: { name: true } } },
          },
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId: session.id,
          type: "PAYMENT",
          amount: totalPrice,
          note: `Pesanan #${newOrder.id}`,
          orderId: newOrder.id,
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
