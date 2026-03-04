"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  FiDollarSign, FiShoppingBag, FiPackage, FiList,
  FiArrowUpRight, FiCalendar, FiTrendingUp,
} from "react-icons/fi";
import Link from "next/link";

interface DashboardData {
  canteenName: string;
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalMenus: number;
  menuBreakdown: { name: string; quantity: number; revenue: number }[];
}

export default function SellerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/dashboard")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
            <p className="text-stone-400 text-sm mt-1">{data?.canteenName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-400 bg-white border border-stone-100 px-3 py-1.5 rounded-lg w-fit">
            <FiCalendar size={14} />
            {today}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Pendapatan Hari Ini", value: formatRupiah(data?.totalRevenue ?? 0),
            icon: <FiDollarSign className="text-white" size={18} />,
            bg: "from-green-500 to-green-700", pill: "bg-green-50 text-green-600", pillLabel: "Hari ini",
          },
          {
            label: "Total Pesanan", value: String(data?.totalOrders ?? 0),
            icon: <FiShoppingBag className="text-white" size={18} />,
            bg: "from-blue-500 to-blue-700", pill: "bg-blue-50 text-blue-600", pillLabel: "Hari ini",
          },
          {
            label: "Pesanan Aktif", value: String(data?.activeOrders ?? 0),
            icon: <FiPackage className="text-white" size={18} />,
            bg: "from-amber-500 to-amber-700", pill: "bg-amber-50 text-amber-600", pillLabel: "Berlangsung",
          },
          {
            label: "Total Menu", value: String(data?.totalMenus ?? 0),
            icon: <FiList className="text-white" size={18} />,
            bg: "from-purple-500 to-purple-700", pill: "bg-purple-50 text-purple-600", pillLabel: "Terdaftar",
          },
        ].map((stat) => (
          <div key={stat.label} className="group relative bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md transition-all overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 bg-linear-to-br ${stat.bg} rounded-xl flex items-center justify-center shadow`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.pill}`}>{stat.pillLabel}</span>
            </div>
            <p className="text-xs text-stone-400 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-stone-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/seller/orders" className="group relative bg-linear-to-br from-green-600 to-green-800 text-white rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3">
            <FiPackage size={20} />
          </div>
          <p className="font-semibold text-base">Pesanan Masuk</p>
          <p className="text-sm text-green-200 mt-1">Terima dan kelola pesanan pembeli</p>
          <FiArrowUpRight size={18} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link href="/seller/menu" className="group relative bg-linear-to-br from-stone-700 to-stone-900 text-white rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3">
            <FiShoppingBag size={20} />
          </div>
          <p className="font-semibold text-base">Kelola Menu</p>
          <p className="text-sm text-stone-400 mt-1">Tambah, edit, atau nonaktifkan produk</p>
          <FiArrowUpRight size={18} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Top Selling Today */}
      {data?.menuBreakdown && data.menuBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-800 text-sm">Menu Terlaris Hari Ini</h2>
              <p className="text-xs text-stone-400 mt-0.5">{data.menuBreakdown.length} item terjual</p>
            </div>
            <Link href="/seller/menu" className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1">
              Lihat menu <FiArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {data.menuBreakdown.map((item, i) => {
              const max = Math.max(...data.menuBreakdown.map((m) => m.quantity));
              const pct = max > 0 ? (item.quantity / max) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50/50 transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-stone-200 text-stone-600" : "bg-stone-100 text-stone-500"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-stone-800 text-sm truncate">{item.name}</span>
                      <span className="text-sm font-semibold text-stone-700 tabular-nums shrink-0 ml-3">{item.quantity} porsi</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 shrink-0 tabular-nums w-24 text-right">{formatRupiah(item.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.menuBreakdown?.length === 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400">
          <FiTrendingUp size={40} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm">Belum ada pesanan hari ini</p>
        </div>
      )}
    </div>
  );
}
