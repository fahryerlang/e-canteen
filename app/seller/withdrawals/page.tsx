"use client";

import { useState, useEffect, FormEvent } from "react";
import { FiSend, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiTrendingUp, FiArrowDownCircle } from "react-icons/fi";
import { formatRupiah } from "@/lib/utils";

interface WithdrawalData {
  id: number;
  amount: number;
  note: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface Summary {
  totalRevenue: number;
  totalWithdrawn: number;
  pendingAmount: number;
  availableBalance: number;
}

export default function SellerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = () => {
    fetch("/api/seller/withdrawals")
      .then((res) => res.json())
      .then((data) => {
        setWithdrawals(data.withdrawals || []);
        setSummary(data.summary || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/seller/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          note: note || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal mengirim permintaan" });
      } else {
        setMessage({ type: "success", text: "Permintaan setoran berhasil dikirim!" });
        setAmount("");
        setNote("");
        fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    PENDING: { label: "Menunggu", icon: <FiClock size={14} />, color: "bg-amber-50 text-amber-600" },
    APPROVED: { label: "Disetujui", icon: <FiCheckCircle size={14} />, color: "bg-emerald-50 text-emerald-600" },
    REJECTED: { label: "Ditolak", icon: <FiXCircle size={14} />, color: "bg-red-50 text-red-600" },
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <FiSend className="text-green-600" />
          Setor Saldo
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Setor pendapatan penjualan Anda ke admin
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiTrendingUp size={20} />
              </div>
              <span className="text-sm text-stone-500">Total Pendapatan</span>
            </div>
            <p className="text-xl font-bold text-stone-800">{formatRupiah(summary.totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle size={20} />
              </div>
              <span className="text-sm text-stone-500">Sudah Disetor</span>
            </div>
            <p className="text-xl font-bold text-stone-800">{formatRupiah(summary.totalWithdrawn)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiClock size={20} />
              </div>
              <span className="text-sm text-stone-500">Menunggu Setoran</span>
            </div>
            <p className="text-xl font-bold text-stone-800">{formatRupiah(summary.pendingAmount)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-green-200 p-5 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center">
                <FiDollarSign size={20} />
              </div>
              <span className="text-sm text-green-700">Saldo Tersedia</span>
            </div>
            <p className="text-xl font-bold text-green-800">{formatRupiah(summary.availableBalance)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <FiArrowDownCircle className="text-green-600" />
              Ajukan Setoran
            </h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Jumlah Setoran
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={1}
                    max={summary?.availableBalance || 0}
                    required
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                {summary && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(summary.availableBalance))}
                    className="mt-1.5 text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Setor semua ({formatRupiah(summary.availableBalance)})
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Catatan (opsional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan..."
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FiSend size={14} />
                {submitting ? "Mengirim..." : "Ajukan Setoran"}
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200">
            <div className="p-5 border-b border-stone-100">
              <h2 className="text-lg font-semibold text-stone-800">Riwayat Setoran</h2>
            </div>

            {withdrawals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <FiSend size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">Belum ada riwayat setoran</p>
                <p className="text-xs mt-1">Ajukan setoran pertama Anda</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {withdrawals.map((w) => {
                  const cfg = statusConfig[w.status];
                  return (
                    <div key={w.id} className="px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            w.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-600"
                              : w.status === "PENDING"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          <FiSend size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-800">
                            {formatRupiah(w.amount)}
                          </p>
                          {w.note && (
                            <p className="text-xs text-stone-400 mt-0.5">{w.note}</p>
                          )}
                          <p className="text-xs text-stone-400 mt-0.5">
                            {new Date(w.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
