"use client";

import { useState, useEffect } from "react";
import { FiPackage } from "react-icons/fi";
import {
  formatRupiah,
  formatDate,
  pickupTimeLabel,
  orderStatusLabel,
  orderStatusColor,
} from "@/lib/utils";
import { FiChevronDown } from "react-icons/fi";

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
  user: { name: string; email: string };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch {
      alert("Gagal mengupdate status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    if (filter === "ISTIRAHAT_1" || filter === "ISTIRAHAT_2")
      return order.pickupTime === filter;
    return order.status === filter;
  });

  const groupedByPickup = {
    ISTIRAHAT_1: filteredOrders.filter(
      (o) => o.pickupTime === "ISTIRAHAT_1"
    ),
    ISTIRAHAT_2: filteredOrders.filter(
      (o) => o.pickupTime === "ISTIRAHAT_2"
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Antrean Pesanan</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {orders.filter((o) => o.status !== "SELESAI").length} pesanan aktif
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "DIPROSES", "SIAP_DIAMBIL", "SELESAI"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-green-700 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {status === "ALL" ? "Semua" : orderStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped by Pickup Time */}
      {(["ISTIRAHAT_1", "ISTIRAHAT_2"] as const).map((time) => {
        const timeOrders = groupedByPickup[time];
        if (timeOrders.length === 0) return null;

        return (
          <div key={time} className="mb-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              {pickupTimeLabel(time)}
              <span className="text-sm text-stone-400 font-normal">
                ({timeOrders.length} pesanan)
              </span>
            </h2>

            <div className="space-y-4">
              {timeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
                >
                  <div className="p-5 border-b border-stone-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-stone-800 text-sm">
                            #{order.id} - {order.user.name}
                          </p>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${orderStatusColor(
                              order.status
                            )}`}
                          >
                            {orderStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {/* Status changer */}
                      {order.status !== "SELESAI" && (
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className="appearance-none bg-white border border-stone-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-stone-700 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none cursor-pointer"
                          >
                            <option value="DIPROSES">Sedang Disiapkan</option>
                            <option value="SIAP_DIAMBIL">Siap Diambil</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                          <FiChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                            size={14}
                          />
                        </div>
                      )}
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
          </div>
        );
      })}

      {filteredOrders.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <FiPackage className="text-stone-300 mx-auto mb-4" size={64} />
          <p className="text-lg">Tidak ada pesanan</p>
        </div>
      )}
    </div>
  );
}
