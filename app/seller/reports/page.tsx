"use client";

import { useEffect, useState, useCallback } from "react";
import { FiDollarSign, FiShoppingCart, FiPackage, FiTrendingUp, FiCalendar } from "react-icons/fi";

interface MenuBreakdown {
  menuId: number;
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

interface DailyRevenue {
  date: string;
  amount: number;
}

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  menuBreakdown: MenuBreakdown[];
  dailyRevenue: DailyRevenue[];
  orders: { id: number; customer: string; total: number; itemCount: number; createdAt: string }[];
}

export default function SellerReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (datePreset) {
      case "today": {
        const d = now.toISOString().slice(0, 10);
        return { from: d, to: d };
      }
      case "7d": {
        const f = new Date(now);
        f.setDate(f.getDate() - 7);
        return { from: f.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
      }
      case "30d": {
        const f = new Date(now);
        f.setDate(f.getDate() - 30);
        return { from: f.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
      }
      case "custom":
        return { from: customFrom, to: customTo };
      default:
        return {};
    }
  }, [datePreset, customFrom, customTo]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const { from, to } = getDateRange();
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/seller/reports?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [getDateRange]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const categoryLabel = (c: string) => (c === "MAKANAN" ? "Makanan" : c === "MINUMAN" ? "Minuman" : "Snack");
  const categoryBadge = (c: string) =>
    c === "MAKANAN" ? "bg-orange-100 text-orange-700" : c === "MINUMAN" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700";

  const maxRevenue = data ? Math.max(...(data.dailyRevenue.map((d) => d.amount)), 1) : 1;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-stone-50 in-[.sidebar-closed]:pl-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Laporan Penjualan</h1>
          <p className="text-sm text-stone-400 mt-1">Ringkasan penjualan kantin Anda</p>
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <FiCalendar className="text-stone-400" size={15} />
          {[
            { key: "today", label: "Hari Ini" },
            { key: "7d", label: "7 Hari" },
            { key: "30d", label: "30 Hari" },
            { key: "custom", label: "Kustom" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setDatePreset(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                datePreset === p.key ? "bg-green-600 text-white" : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {datePreset === "custom" && (
        <div className="flex gap-3 mb-6 items-end">
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Dari</label>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Sampai</label>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white" />
          </div>
          <button onClick={fetchReport} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            Terapkan
          </button>
        </div>
      )}

      {!loading && !data ? (
        <div className="text-center py-20 text-stone-400">Gagal memuat data</div>
      ) : !loading && data ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Pendapatan", value: formatRp(data.totalRevenue), icon: <FiDollarSign />, color: "text-green-600 bg-green-50" },
              { label: "Total Pesanan", value: data.totalOrders.toString(), icon: <FiShoppingCart />, color: "text-blue-600 bg-blue-50" },
              { label: "Item Terjual", value: data.totalItemsSold.toString(), icon: <FiPackage />, color: "text-amber-600 bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-stone-800">{s.value}</p>
                <p className="text-xs text-stone-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart (simple bar) */}
          {data.dailyRevenue.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiTrendingUp className="text-green-600" />
                <h3 className="text-sm font-semibold text-stone-700">Pendapatan Harian</h3>
              </div>
              <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-2">
                {data.dailyRevenue.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1 min-w-9">
                    <span className="text-[9px] text-stone-400 font-medium">{formatRp(d.amount)}</span>
                    <div
                      className="w-7 bg-linear-to-t from-green-600 to-green-400 rounded-t-md transition-all"
                      style={{ height: `${Math.max((d.amount / maxRevenue) * 120, 4)}px` }}
                    />
                    <span className="text-[9px] text-stone-400">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-700">Penjualan Per Menu</h3>
            </div>
            {data.menuBreakdown.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">Belum ada data penjualan</div>
            ) : (
              <div className="divide-y divide-stone-50">
                {data.menuBreakdown.map((m, i) => (
                  <div key={m.menuId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{m.name}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-0.5 ${categoryBadge(m.category)}`}>
                        {categoryLabel(m.category)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-700">{formatRp(m.revenue)}</p>
                      <p className="text-[11px] text-stone-400">{m.qty} terjual</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-700">Pesanan Terbaru</h3>
            </div>
            {data.orders.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">Belum ada pesanan</div>
            ) : (
              <div className="divide-y divide-stone-50">
                {data.orders.slice(0, 20).map((o) => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">#{o.id}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{o.customer}</p>
                      <p className="text-xs text-stone-400">{formatDate(o.createdAt)} &middot; {o.itemCount} item</p>
                    </div>
                    <p className="text-sm font-bold text-stone-700">{formatRp(o.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
