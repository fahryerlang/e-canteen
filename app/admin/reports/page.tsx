"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiDollarSign, FiShoppingBag, FiPackage, FiCalendar, FiTrendingUp, FiBarChart2, FiRefreshCw, FiDownload, FiFileText, FiFile } from "react-icons/fi";

interface Report {
  date: string;
  dateTo?: string;
  totalRevenue: number;
  totalOrders: number;
  menuBreakdown: { name: string; quantity: number; revenue: number }[];
}

type DatePreset = "today" | "yesterday" | "week" | "month" | "custom";

function formatDateInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<DatePreset>("today");
  const [dateFrom, setDateFrom] = useState(formatDateInput(new Date()));
  const [dateTo, setDateTo] = useState(formatDateInput(new Date()));

  const fetchReport = useCallback(async () => {
    setLoading(true);
    let url = "/api/reports/daily";

    if (preset === "today") {
      url += `?date=${formatDateInput(new Date())}`;
    } else if (preset === "yesterday") {
      const y = new Date(); y.setDate(y.getDate() - 1);
      url += `?date=${formatDateInput(y)}`;
    } else if (preset === "week") {
      const to = new Date();
      const from = new Date(); from.setDate(from.getDate() - 6);
      url += `?from=${formatDateInput(from)}&to=${formatDateInput(to)}`;
    } else if (preset === "month") {
      const to = new Date();
      const from = new Date(); from.setDate(from.getDate() - 29);
      url += `?from=${formatDateInput(from)}&to=${formatDateInput(to)}`;
    } else {
      url += `?from=${dateFrom}&to=${dateTo}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setReport(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [preset, dateFrom, dateTo]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const PRESETS: { value: DatePreset; label: string }[] = [
    { value: "today", label: "Hari Ini" },
    { value: "yesterday", label: "Kemarin" },
    { value: "week", label: "7 Hari" },
    { value: "month", label: "30 Hari" },
    { value: "custom", label: "Kustom" },
  ];

  const exportCSV = () => {
    if (!report?.menuBreakdown?.length) return;
    const rows = [
      ["No", "Nama Menu", "Jumlah Terjual", "Pendapatan"],
      ...report.menuBreakdown.map((m, i) => [
        String(i + 1), m.name, String(m.quantity), String(m.revenue),
      ]),
      ["", "TOTAL", String(report.menuBreakdown.reduce((s, m) => s + m.quantity, 0)), String(report.totalRevenue)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${report.date}${report.dateTo && report.dateTo !== report.date ? `-to-${report.dateTo}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilename = (ext: string) => {
    const base = `laporan-${report?.date || ""}`;
    const suffix = report?.dateTo && report.dateTo !== report.date ? `-to-${report.dateTo}` : "";
    return `${base}${suffix}.${ext}`;
  };

  const exportPDF = async () => {
    if (!report?.menuBreakdown?.length) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const dateLabel = report.dateTo && report.dateTo !== report.date
      ? `${report.date} s/d ${report.dateTo}`
      : report.date;

    doc.setFontSize(18);
    doc.text("Laporan Penjualan E-Canteen", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periode: ${dateLabel}`, 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Pendapatan: ${formatRupiah(report.totalRevenue)}`, 14, 40);
    doc.text(`Total Pesanan: ${report.totalOrders}`, 14, 46);
    doc.text(`Porsi Terjual: ${report.menuBreakdown.reduce((s, m) => s + m.quantity, 0)}`, 14, 52);

    autoTable(doc, {
      startY: 60,
      head: [["No", "Nama Menu", "Jumlah Terjual", "Pendapatan"]],
      body: report.menuBreakdown.map((m, i) => [
        i + 1,
        m.name,
        `${m.quantity} porsi`,
        formatRupiah(m.revenue),
      ]),
      foot: [["", "TOTAL", `${report.menuBreakdown.reduce((s, m) => s + m.quantity, 0)} porsi`, formatRupiah(report.totalRevenue)]],
      theme: "grid",
      headStyles: { fillColor: [22, 101, 52] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    doc.save(getFilename("pdf"));
  };

  const exportExcel = async () => {
    if (!report?.menuBreakdown?.length) return;
    const XLSX = await import("xlsx");

    const data = [
      ["Laporan Penjualan E-Canteen"],
      [`Periode: ${report.date}${report.dateTo && report.dateTo !== report.date ? ` s/d ${report.dateTo}` : ""}`],
      [],
      ["Total Pendapatan", report.totalRevenue],
      ["Total Pesanan", report.totalOrders],
      ["Porsi Terjual", report.menuBreakdown.reduce((s, m) => s + m.quantity, 0)],
      [],
      ["No", "Nama Menu", "Jumlah Terjual", "Pendapatan"],
      ...report.menuBreakdown.map((m, i) => [i + 1, m.name, m.quantity, m.revenue]),
      ["", "TOTAL", report.menuBreakdown.reduce((s, m) => s + m.quantity, 0), report.totalRevenue],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, getFilename("xlsx"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Laporan Penjualan</h1>
          <p className="text-stone-400 mt-1 text-sm">Rekapitulasi dan analisis penjualan</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportPDF}
            disabled={!report?.menuBreakdown?.length}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            <FiFileText size={14} />
            PDF
          </button>
          <button
            onClick={exportExcel}
            disabled={!report?.menuBreakdown?.length}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-40"
          >
            <FiFile size={14} />
            Excel
          </button>
          <button
            onClick={exportCSV}
            disabled={!report?.menuBreakdown?.length}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-40"
          >
            <FiDownload size={14} />
            CSV
          </button>
          <button
            onClick={fetchReport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white border border-stone-100 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <FiCalendar size={15} className="text-green-600" />
          <span className="text-sm font-semibold text-stone-700">Periode:</span>
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                preset === p.value ? "bg-green-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">Dari:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">Sampai:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="group relative bg-linear-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-600/20 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FiDollarSign size={20} />
                  </div>
                  <span className="text-sm font-medium text-green-100">Total Pendapatan</span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{formatRupiah(report?.totalRevenue || 0)}</p>
              </div>
            </div>
            <div className="group relative bg-linear-to-br from-stone-700 to-stone-900 rounded-2xl p-6 text-white overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-600/20 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FiShoppingBag size={20} />
                  </div>
                  <span className="text-sm font-medium text-stone-300">Total Pesanan</span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{report?.totalOrders || 0}</p>
              </div>
            </div>
            <div className="group relative bg-linear-to-br from-emerald-500 to-teal-700 rounded-2xl p-6 text-white overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FiPackage size={20} />
                  </div>
                  <span className="text-sm font-medium text-emerald-100">Porsi Terjual</span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{report?.menuBreakdown?.reduce((sum, m) => sum + m.quantity, 0) || 0}</p>
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
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">No</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Nama Menu</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Terjual</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {report.menuBreakdown.map((item, i) => {
                      const maxQty = Math.max(...report.menuBreakdown.map(m => m.quantity));
                      const pct = maxQty > 0 ? (item.quantity / maxQty) * 100 : 0;
                      return (
                        <tr key={i} className="hover:bg-green-50/30 transition-colors">
                          <td className="px-6 py-4">
                            {i < 3 ? (
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                i === 0 ? "bg-amber-400" : i === 1 ? "bg-stone-400" : "bg-amber-700"
                              }`}>{i + 1}</span>
                            ) : (
                              <span className="text-sm text-stone-400 pl-1.5">{i + 1}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-medium text-stone-800 text-sm">{item.name}</span>
                              <div className="mt-1.5 w-full max-w-45 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-linear-to-r from-green-500 to-green-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-green-100">
                              {item.quantity} <span className="text-green-500 font-normal text-xs">porsi</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-stone-800 text-sm">{formatRupiah(item.revenue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stone-200 bg-stone-50/80">
                      <td colSpan={2} className="px-6 py-4">
                        <span className="flex items-center gap-2 font-bold text-stone-800">
                          <FiTrendingUp size={16} className="text-green-600" /> Total
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-stone-800">
                        {report.menuBreakdown.reduce((sum, m) => sum + m.quantity, 0)} porsi
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-700 text-base">{formatRupiah(report.totalRevenue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400">
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FiBarChart2 size={28} className="text-stone-300" />
                </div>
                <p className="font-medium text-stone-500">Belum ada transaksi di periode ini</p>
                <p className="text-sm mt-1 text-stone-400">Coba pilih rentang tanggal lain</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
