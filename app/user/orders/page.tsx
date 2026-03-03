"use client";

import { useState, useEffect } from "react";
import { FiClipboard } from "react-icons/fi";
import { formatRupiah, formatDate, pickupTimeLabel, orderStatusLabel, orderStatusColor } from "@/lib/utils";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  menu: { name: string; image: string | null };
}

interface Order {
  id: number;
  pickupTime: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Pesanan Saya</h1>
      <p className="text-stone-400 mb-8 text-sm">Pantau status pesanan kamu di sini</p>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <FiClipboard className="text-stone-300 mx-auto mb-4" size={64} />
          <p className="text-lg">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
            >
              <div className="p-5 border-b border-stone-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-stone-500">
                      Pesanan #{order.id}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">
                      {pickupTimeLabel(order.pickupTime)}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${orderStatusColor(
                        order.status
                      )}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-1.5"
                  >
                    <span className="text-stone-500">
                      {item.menu.name} x{item.quantity}
                    </span>
                    <span className="text-stone-800 font-medium">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-stone-100 mt-3 pt-3 flex justify-between">
                  <span className="font-semibold text-stone-800">Total</span>
                  <span className="font-bold text-green-700">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
