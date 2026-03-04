"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiDollarSign, FiShoppingBag, FiPackage, FiTrendingUp, FiArrowUpRight, FiCalendar } from "react-icons/fi";
import Link from "next/link";

interface Report {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  menuBreakdown: { name: string; quantity: number; revenue: number }[];
}

export default function AdminDashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/daily")
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
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
            <p className="text-stone-400 text-sm mt-1">Ringkasan aktivitas kantin hari ini</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-400 bg-white border border-stone-100 px-3 py-1.5 rounded-lg w-fit">
            <FiCalendar size={14} />
            {today}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="group relative bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-lg hover:shadow-green-500/5 hover:border-green-100 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 bg-linear-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <FiDollarSign className="text-white" size={20} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Hari ini</span>
            </div>
            <p className="text-sm text-stone-400 mb-1">Pendapatan</p>
            <p className="text-2xl font-bold text-stone-900">
              {formatRupiah(report?.totalRevenue || 0)}
            </p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FiShoppingBag className="text-white" size={20} />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Hari ini</span>
            </div>
            <p className="text-sm text-stone-400 mb-1">Total Pesanan</p>
            <p className="text-2xl font-bold text-stone-900">
              {report?.totalOrders || 0}
            </p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-100 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 bg-linear-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <FiPackage className="text-white" size={20} />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Hari ini</span>
            </div>
            <p className="text-sm text-stone-400 mb-1">Item Terjual</p>
            <p className="text-2xl font-bold text-stone-900">
              {report?.menuBreakdown?.reduce((sum, m) => sum + m.quantity, 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/orders"
          className="group relative bg-linear-to-br from-green-600 to-green-800 text-white rounded-2xl p-6 hover:shadow-xl hover:shadow-green-700/20 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
              <FiPackage size={20} />
            </div>
            <p className="font-semibold text-base">Antrean Pesanan</p>
            <p className="text-sm text-green-200 mt-1">Lihat dan kelola pesanan masuk</p>
            <FiArrowUpRight size={18} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        <Link
          href="/admin/menu"
          className="group relative bg-linear-to-br from-stone-700 to-stone-900 text-white rounded-2xl p-6 hover:shadow-xl hover:shadow-stone-700/20 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
              <FiShoppingBag size={20} />
            </div>
            <p className="font-semibold text-base">Kelola Menu</p>
            <p className="text-sm text-stone-400 mt-1">Tambah, edit, atau hapus menu</p>
            <FiArrowUpRight size={18} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        <Link
          href="/admin/reports"
          className="group relative bg-linear-to-br from-green-700 to-emerald-900 text-white rounded-2xl p-6 hover:shadow-xl hover:shadow-green-700/20 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
              <FiTrendingUp size={20} />
            </div>
            <p className="font-semibold text-base">Laporan Harian</p>
            <p className="text-sm text-green-200 mt-1">Lihat rekapitulasi penjualan</p>
            <FiArrowUpRight size={18} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      </div>

      {/* Top Menu Today */}
      {report?.menuBreakdown && report.menuBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-800 text-sm">Menu Terlaris Hari Ini</h2>
              <p className="text-xs text-stone-400 mt-0.5">{report.menuBreakdown.length} item terjual</p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-green-700 font-medium hover:text-green-800 flex items-center gap-1 hover:underline underline-offset-2"
            >
              Lihat detail
              <FiArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {report.menuBreakdown.map((item, i) => {
              const maxQty = Math.max(...report.menuBreakdown.map((m) => m.quantity));
              const pct = maxQty > 0 ? (item.quantity / maxQty) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50/50 transition-colors"
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0
                        ? "bg-linear-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-400/30"
                        : i === 1
                          ? "bg-stone-200 text-stone-600"
                          : i === 2
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-stone-800 text-sm truncate">{item.name}</span>
                      <span className="text-sm font-semibold text-stone-700 tabular-nums shrink-0 ml-3">
                        {item.quantity} porsi
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 shrink-0 tabular-nums w-24 text-right">
                    {formatRupiah(item.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
