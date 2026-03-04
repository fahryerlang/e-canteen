"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiDollarSign, FiShoppingBag, FiPackage, FiCalendar, FiTrendingUp, FiBarChart2 } from "react-icons/fi";

interface Report {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  menuBreakdown: { name: string; quantity: number; revenue: number }[];
}

export default function AdminReportsPage() {
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
      <div className="flex items-end justify-between">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Laporan Harian</h1>
          <p className="text-stone-400 mt-1 text-sm">
            Rekapitulasi penjualan hari ini
          </p>
        </div>
        {report?.date && (
          <div className="flex items-center gap-2 bg-white border border-stone-100 px-4 py-2 rounded-xl text-sm text-stone-500">
            <FiCalendar size={14} className="text-green-600" />
            <span className="font-medium text-stone-700">{report.date}</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Revenue Card */}
        <div className="group relative bg-linear-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-600/20 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute right-6 bottom-6 w-16 h-16 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiDollarSign size={20} />
              </div>
              <span className="text-sm font-medium text-green-100">
                Total Pendapatan
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {formatRupiah(report?.totalRevenue || 0)}
            </p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="group relative bg-linear-to-br from-stone-700 to-stone-900 rounded-2xl p-6 text-white overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-600/20 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute right-6 bottom-6 w-16 h-16 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiShoppingBag size={20} />
              </div>
              <span className="text-sm font-medium text-stone-300">
                Total Pesanan
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">{report?.totalOrders || 0}</p>
          </div>
        </div>

        {/* Portions Card */}
        <div className="group relative bg-linear-to-br from-emerald-500 to-teal-700 rounded-2xl p-6 text-white overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute right-6 bottom-6 w-16 h-16 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiPackage size={20} />
              </div>
              <span className="text-sm font-medium text-emerald-100">
                Porsi Terjual
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {report?.menuBreakdown?.reduce((sum, m) => sum + m.quantity, 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
            <FiBarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-800 text-sm">Detail Per Menu</h2>
            <p className="text-xs text-stone-400 mt-0.5">Breakdown penjualan tiap item</p>
          </div>
        </div>
        {report?.menuBreakdown && report.menuBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    No
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Nama Menu
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Terjual
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {report.menuBreakdown.map((item, i) => {
                  const maxQty = Math.max(...report.menuBreakdown.map(m => m.quantity));
                  const pct = maxQty > 0 ? (item.quantity / maxQty) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-green-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        {i < 3 ? (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            i === 0 ? "bg-amber-400" : i === 1 ? "bg-stone-400" : "bg-amber-700"
                          }`}>
                            {i + 1}
                          </span>
                        ) : (
                          <span className="text-sm text-stone-400 pl-1.5">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-stone-800 text-sm">
                            {item.name}
                          </span>
                          <div className="mt-1.5 w-full max-w-45 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-green-100">
                          {item.quantity}
                          <span className="text-green-500 font-normal text-xs">porsi</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-stone-800 text-sm">
                        {formatRupiah(item.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-200 bg-stone-50/80">
                  <td colSpan={2} className="px-6 py-4">
                    <span className="flex items-center gap-2 font-bold text-stone-800">
                      <FiTrendingUp size={16} className="text-green-600" />
                      Total
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-stone-800">
                    {report.menuBreakdown.reduce(
                      (sum, m) => sum + m.quantity,
                      0
                    )}{" "}
                    porsi
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-700 text-base">
                    {formatRupiah(report.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-stone-400">
            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiBarChart2 size={28} className="text-stone-300" />
            </div>
            <p className="font-medium text-stone-500">Belum ada transaksi hari ini</p>
            <p className="text-sm mt-1 text-stone-400">Data akan muncul saat ada pesanan selesai</p>
          </div>
        )}
      </div>
    </div>
  );
}
