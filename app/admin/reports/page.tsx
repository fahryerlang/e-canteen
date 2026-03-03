"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiDollarSign, FiShoppingBag, FiPackage } from "react-icons/fi";

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
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Laporan Harian</h1>
      <p className="text-stone-400 mb-8 text-sm">
        Rekapitulasi penjualan hari ini ({report?.date || "-"})
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-green-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <FiDollarSign size={20} />
            </div>
            <span className="text-sm font-medium text-green-200">
              Total Pendapatan
            </span>
          </div>
          <p className="text-3xl font-bold">
            {formatRupiah(report?.totalRevenue || 0)}
          </p>
        </div>

        <div className="bg-stone-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <FiShoppingBag size={20} />
            </div>
            <span className="text-sm font-medium text-stone-400">
              Total Pesanan
            </span>
          </div>
          <p className="text-3xl font-bold">{report?.totalOrders || 0}</p>
        </div>

        <div className="bg-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <FiPackage size={20} />
            </div>
            <span className="text-sm font-medium text-green-200">
              Total Porsi Terjual
            </span>
          </div>
          <p className="text-3xl font-bold">
            {report?.menuBreakdown?.reduce((sum, m) => sum + m.quantity, 0) || 0}
          </p>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 text-sm">Detail Per Menu</h2>
        </div>
        {report?.menuBreakdown && report.menuBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-400">
                    No
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-400">
                    Nama Menu
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-stone-400">
                    Jumlah Terjual
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-stone-400">
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {report.menuBreakdown.map((item, i) => (
                  <tr key={i} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-stone-400">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-800 text-sm">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.quantity} porsi
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-stone-800 text-sm">
                      {formatRupiah(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-200 bg-stone-50">
                  <td colSpan={2} className="px-6 py-4 font-bold text-stone-800">
                    Total
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-stone-800">
                    {report.menuBreakdown.reduce(
                      (sum, m) => sum + m.quantity,
                      0
                    )}{" "}
                    porsi
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">
                    {formatRupiah(report.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400">
            <p>Belum ada transaksi hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
