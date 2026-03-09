"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah, formatDate, pickupTimeLabel, orderStatusLabel, orderStatusColor } from "@/lib/utils";
import { FiPackage, FiRefreshCw, FiChevronDown, FiClock, FiCheckCircle, FiAlertCircle, FiUser } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

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

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/seller/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: number, status: string) => {
    await fetch(`/api/seller/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders(true);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "DIPROSES": return <FiClock size={14} />;
      case "SIAP_DIAMBIL": return <FiAlertCircle size={14} />;
      case "SELESAI": return <FiCheckCircle size={14} />;
      default: return null;
    }
  };

  const statusAccent = (status: string) => {
    switch (status) {
      case "DIPROSES": return "border-l-amber-400";
      case "SIAP_DIAMBIL": return "border-l-blue-400";
      case "SELESAI": return "border-l-green-400";
      default: return "border-l-stone-300";
    }
  };

  const countByStatus = {
    DIPROSES: orders.filter((o) => o.status === "DIPROSES").length,
    SIAP_DIAMBIL: orders.filter((o) => o.status === "SIAP_DIAMBIL").length,
    SELESAI: orders.filter((o) => o.status === "SELESAI").length,
  };
  const activeCount = countByStatus.DIPROSES + countByStatus.SIAP_DIAMBIL;

  const filtered = orders.filter((o) => filter === "ALL" || o.status === filter);
  const grouped: Record<string, Order[]> = {
    ISTIRAHAT_1: filtered.filter((o) => o.pickupTime === "ISTIRAHAT_1"),
    ISTIRAHAT_2: filtered.filter((o) => o.pickupTime === "ISTIRAHAT_2"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Pesanan Masuk</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {activeCount > 0 ? `${activeCount} pesanan aktif` : "Belum ada pesanan baru"} &middot; {orders.length} total
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter(filter === "DIPROSES" ? "ALL" : "DIPROSES")}
          className={`text-left rounded-xl px-4 py-3 border transition-all ${
            filter === "DIPROSES"
              ? "bg-amber-50 border-amber-200 shadow-sm"
              : "bg-white border-stone-100 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <FiClock size={13} />
            <span className="text-[11px] font-medium">Disiapkan</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{countByStatus.DIPROSES}</p>
        </button>
        <button
          onClick={() => setFilter(filter === "SIAP_DIAMBIL" ? "ALL" : "SIAP_DIAMBIL")}
          className={`text-left rounded-xl px-4 py-3 border transition-all ${
            filter === "SIAP_DIAMBIL"
              ? "bg-blue-50 border-blue-200 shadow-sm"
              : "bg-white border-stone-100 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <FiAlertCircle size={13} />
            <span className="text-[11px] font-medium">Siap Diambil</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{countByStatus.SIAP_DIAMBIL}</p>
        </button>
        <button
          onClick={() => setFilter(filter === "SELESAI" ? "ALL" : "SELESAI")}
          className={`text-left rounded-xl px-4 py-3 border transition-all ${
            filter === "SELESAI"
              ? "bg-green-50 border-green-200 shadow-sm"
              : "bg-white border-stone-100 hover:border-green-200"
          }`}
        >
          <div className="flex items-center gap-1.5 text-green-600 mb-1">
            <FiCheckCircle size={13} />
            <span className="text-[11px] font-medium">Selesai</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{countByStatus.SELESAI}</p>
        </button>
      </div>

      {/* Filter Indicator */}
      {filter !== "ALL" && (
        <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5">
          <span className="text-xs text-stone-500">
            Menampilkan: <span className="font-semibold text-stone-700">{orderStatusLabel(filter)}</span> ({filtered.length})
          </span>
          <button onClick={() => setFilter("ALL")} className="text-xs text-green-700 font-medium hover:underline">
            Tampilkan Semua
          </button>
        </div>
      )}

      {/* Orders grouped by pickup time */}
      {(["ISTIRAHAT_1", "ISTIRAHAT_2"] as const).map((time) => {
        const timeOrders = grouped[time];
        if (timeOrders.length === 0) return null;
        return (
          <div key={time}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FiClock size={15} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-800">{pickupTimeLabel(time)}</h2>
                <p className="text-[11px] text-stone-400">{timeOrders.length} pesanan</p>
              </div>
            </div>

            <div className="space-y-3">
              {timeOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border border-stone-100 border-l-4 ${statusAccent(order.status)} overflow-hidden transition-all hover:shadow-sm ${
                    order.status === "SELESAI" ? "opacity-70" : ""
                  }`}
                >
                  {/* Order Header */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        order.status === "DIPROSES" ? "bg-amber-100 text-amber-600" :
                        order.status === "SIAP_DIAMBIL" ? "bg-blue-100 text-blue-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {statusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-stone-800 text-sm">
                            Pesanan #{order.id}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${orderStatusColor(order.status)}`}>
                            {statusIcon(order.status)}
                            {orderStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-stone-500">
                            <FiUser size={11} />
                            {order.user.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-stone-400">
                            <FiClock size={11} />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Changer */}
                    {order.status !== "SELESAI" ? (
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`appearance-none border rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none cursor-pointer transition-colors ${
                            order.status === "DIPROSES"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-blue-50 border-blue-200 text-blue-700"
                          }`}
                        >
                          <option value="DIPROSES">Sedang Disiapkan</option>
                          <option value="SIAP_DIAMBIL">Siap Diambil</option>
                          <option value="SELESAI">Selesai</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={13} />
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                        <FiCheckCircle size={13} />
                        Selesai
                      </span>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="px-5 pb-4">
                    <div className="bg-stone-50/80 rounded-xl p-3 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-white border border-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                              {item.menu.image ? (
                                <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                              ) : (
                                <MdOutlineRestaurant className="text-stone-300" size={14} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-stone-700 truncate">{item.menu.name}</p>
                              <p className="text-[11px] text-stone-400">{item.quantity}x @ {formatRupiah(item.unitPrice)}</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-stone-700 shrink-0">
                            {formatRupiah(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      ))}

                      <div className="border-t border-stone-200/60 pt-2 mt-2 flex justify-between items-center">
                        <span className="text-xs font-medium text-stone-500">Subtotal (item kantin ini)</span>
                        <span className="text-sm font-bold text-green-700">
                          {formatRupiah(order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPackage className="text-stone-300" size={32} />
          </div>
          <p className="text-lg font-medium text-stone-600">
            {filter !== "ALL" ? "Tidak ada pesanan dengan status ini" : "Belum ada pesanan masuk"}
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {filter !== "ALL" ? "Coba ubah filter untuk melihat pesanan lain" : "Pesanan baru akan muncul di sini secara otomatis"}
          </p>
        </div>
      )}
    </div>
  );
}
