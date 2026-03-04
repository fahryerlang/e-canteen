"use client";

import { useState, useEffect, FormEvent } from "react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { FiDollarSign, FiPlus, FiCheck, FiX, FiCreditCard, FiArrowUpRight, FiInfo, FiArrowDownLeft, FiClock, FiSend } from "react-icons/fi";

interface UserData {
  id: number;
  name: string;
  balance: number;
}

interface Transaction {
  id: number;
  type: "TOPUP" | "PAYMENT";
  amount: number;
  note: string | null;
  status: string;
  createdAt: string;
}

const TOPUP_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TopUpPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {});

    fetch("/api/user/transactions")
      .then((res) => res.json())
      .then((data) => { setTransactions(Array.isArray(data) ? data : []); setLoadingTx(false); })
      .catch(() => setLoadingTx(false));
  }, []);

  const selectedAmount = amount || parseFloat(customAmount) || 0;

  const handleTopUp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedAmount || selectedAmount <= 0) {
      setError("Masukkan jumlah top up yang valid");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount, note: note || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim permintaan");
        return;
      }

      setSuccess(data.message || "Permintaan top-up berhasil dikirim!");
      setAmount(0);
      setCustomAmount("");
      setNote("");

      // Refresh transaction history
      fetch("/api/user/transactions")
        .then((res) => res.json())
        .then((d) => setTransactions(Array.isArray(d) ? d : []))
        .catch(() => {});
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-amber-100 text-amber-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-stone-100 text-stone-600";
    }
  };
  const statusLabel = (s: string) => (s === "PENDING" ? "Menunggu" : s === "APPROVED" ? "Disetujui" : s === "REJECTED" ? "Ditolak" : s);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <h1 className="text-2xl font-bold text-stone-900">Top Up Saldo</h1>
        <p className="text-stone-400 mt-1 text-sm">Kirim permintaan top up ke admin</p>
      </div>

      {/* Main Content  2 col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Balance + Info (sticky on desktop) */}
        <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-8 lg:self-start">
          {/* Balance Card */}
          <div className="relative overflow-hidden bg-linear-to-br from-green-700 via-green-800 to-emerald-900 rounded-2xl p-6 text-white">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FiCreditCard size={20} />
                </div>
                <div>
                  <p className="text-green-200 text-xs font-medium">Saldo Saat Ini</p>
                  <p className="text-white/60 text-[11px]">{user?.name ?? "..."}</p>
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                {user ? formatRupiah(user.balance) : "..."}
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white border border-stone-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-stone-700">
              <FiInfo size={15} />
              <h3 className="text-sm font-semibold">Cara Top Up</h3>
            </div>
            <ul className="space-y-2 text-xs text-stone-500">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                Pilih nominal atau masukkan jumlah kustom
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                Kirim permintaan top up ke admin
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                Admin akan menyetujui permintaan Anda
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                Saldo otomatis bertambah setelah disetujui
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Top Up Form */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-stone-100 rounded-2xl p-6">
            <form onSubmit={handleTopUp} className="space-y-6">
              {/* Messages */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  <FiX size={16} className="shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
                  <FiCheck size={16} className="shrink-0" />
                  {success}
                </div>
              )}

              {/* Quick Amounts */}
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-3">
                  Pilih Nominal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TOPUP_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount("");
                        setError("");
                        setSuccess("");
                      }}
                      className={`group relative py-4 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                        amount === amt
                          ? "border-green-600 bg-green-50 text-green-700 shadow-sm shadow-green-100"
                          : "border-stone-200 text-stone-600 hover:border-green-300 hover:bg-green-50/50"
                      }`}
                    >
                      {amount === amt && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <FiCheck size={10} className="text-white" />
                        </div>
                      )}
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-stone-200" />
                <span className="text-xs text-stone-400 font-medium">atau</span>
                <div className="h-px flex-1 bg-stone-200" />
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  Jumlah Lainnya
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">Rp</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(0);
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Masukkan nominal"
                    min="1000"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all text-stone-800 bg-stone-50/50 placeholder:text-stone-300"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-2">
                  Catatan <span className="text-stone-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Transfer via BCA"
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all text-stone-800 bg-stone-50/50 placeholder:text-stone-300 text-sm"
                />
              </div>

              {/* Summary & Submit */}
              <div className="bg-stone-50 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Jumlah Top Up</span>
                  <span className={`text-lg font-bold ${selectedAmount > 0 ? "text-green-700" : "text-stone-400"}`}>
                    {selectedAmount > 0 ? formatRupiah(selectedAmount) : "-"}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading || selectedAmount <= 0}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-600/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <FiSend size={18} />
                      Kirim Permintaan Top Up
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
            <FiClock size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-800 text-sm">Riwayat Transaksi</h2>
            <p className="text-xs text-stone-400 mt-0.5">Top up &amp; pembayaran terbaru</p>
          </div>
        </div>
        {loadingTx ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <FiClock size={32} className="mx-auto mb-3 text-stone-300" />
            <p className="font-medium text-stone-500">Belum ada transaksi</p>
            <p className="text-sm mt-1">Riwayat top up dan pembayaran akan muncul di sini</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === "TOPUP"
                    ? tx.status === "PENDING" ? "bg-amber-100 text-amber-600"
                    : tx.status === "REJECTED" ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {tx.type === "TOPUP" ? <FiArrowDownLeft size={18} /> : <FiArrowUpRight size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-800">
                      {tx.type === "TOPUP" ? "Top Up Saldo" : tx.note || "Pembayaran"}
                    </p>
                    {tx.type === "TOPUP" && tx.status && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(tx.status)}`}>
                        {statusLabel(tx.status)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                  {tx.note && tx.type === "TOPUP" && <p className="text-xs text-stone-400 italic">{tx.note}</p>}
                </div>
                <p className={`text-sm font-bold shrink-0 ${
                  tx.type === "TOPUP"
                    ? tx.status === "REJECTED" ? "text-red-400 line-through" : "text-green-600"
                    : "text-amber-600"
                }`}>
                  {tx.type === "TOPUP" ? "+" : "-"}{formatRupiah(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
