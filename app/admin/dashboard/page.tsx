"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiDollarSign, FiShoppingBag, FiPackage, FiTrendingUp } from "react-icons/fi";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
      <p className="text-gray-500 mb-8">Ringkasan aktivitas kantin hari ini</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Pendapatan Hari Ini</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatRupiah(report?.totalRevenue || 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Total Pesanan</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {report?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiPackage className="text-orange-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Item Terjual</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {report?.menuBreakdown?.reduce((sum, m) => sum + m.quantity, 0) || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="bg-orange-600 text-white rounded-2xl p-5 hover:bg-orange-700 transition-colors"
        >
          <FiPackage size={24} className="mb-2" />
          <p className="font-semibold">Antrean Pesanan</p>
          <p className="text-sm opacity-80">Lihat dan kelola pesanan masuk</p>
        </Link>
        <Link
          href="/admin/menu"
          className="bg-blue-600 text-white rounded-2xl p-5 hover:bg-blue-700 transition-colors"
        >
          <FiShoppingBag size={24} className="mb-2" />
          <p className="font-semibold">Kelola Menu</p>
          <p className="text-sm opacity-80">Tambah, edit, atau hapus menu</p>
        </Link>
        <Link
          href="/admin/reports"
          className="bg-green-600 text-white rounded-2xl p-5 hover:bg-green-700 transition-colors"
        >
          <FiTrendingUp size={24} className="mb-2" />
          <p className="font-semibold">Laporan Harian</p>
          <p className="text-sm opacity-80">Lihat rekapitulasi penjualan</p>
        </Link>
      </div>

      {/* Top Menu Today */}
      {report?.menuBreakdown && report.menuBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Menu Terjual Hari Ini
          </h2>
          <div className="space-y-3">
            {report.menuBreakdown.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm font-bold text-orange-600">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {item.quantity} porsi
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(item.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
