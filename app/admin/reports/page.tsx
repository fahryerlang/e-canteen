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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Harian</h1>
      <p className="text-gray-500 mb-8">
        Rekapitulasi penjualan hari ini ({report?.date || "-"})
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiDollarSign size={20} />
            </div>
            <span className="text-sm font-medium opacity-90">
              Total Pendapatan
            </span>
          </div>
          <p className="text-3xl font-bold">
            {formatRupiah(report?.totalRevenue || 0)}
          </p>
        </div>

        <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiShoppingBag size={20} />
            </div>
            <span className="text-sm font-medium opacity-90">
              Total Pesanan
            </span>
          </div>
          <p className="text-3xl font-bold">{report?.totalOrders || 0}</p>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiPackage size={20} />
            </div>
            <span className="text-sm font-medium opacity-90">
              Total Porsi Terjual
            </span>
          </div>
          <p className="text-3xl font-bold">
            {report?.menuBreakdown?.reduce((sum, m) => sum + m.quantity, 0) || 0}
          </p>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Detail Per Menu</h2>
        </div>
        {report?.menuBreakdown && report.menuBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    No
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Nama Menu
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">
                    Jumlah Terjual
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.menuBreakdown.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        {item.quantity} porsi
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatRupiah(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={2} className="px-6 py-4 font-bold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900">
                    {report.menuBreakdown.reduce(
                      (sum, m) => sum + m.quantity,
                      0
                    )}{" "}
                    porsi
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-orange-600">
                    {formatRupiah(report.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Belum ada transaksi hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
