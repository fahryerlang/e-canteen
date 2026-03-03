"use client";

import { useState, useEffect, FormEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiDollarSign, FiPlus } from "react-icons/fi";

interface UserData {
  id: number;
  name: string;
  balance: number;
}

const TOPUP_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TopUpPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const handleTopUp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const topupAmount = amount || parseFloat(customAmount);
    if (!topupAmount || topupAmount <= 0) {
      setError("Masukkan jumlah top up yang valid");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topupAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal top up");
        return;
      }

      setUser((prev) => (prev ? { ...prev, balance: data.balance } : prev));
      setSuccess(`Berhasil top up ${formatRupiah(topupAmount)}`);
      setAmount(0);
      setCustomAmount("");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Top Up Saldo</h1>
      <p className="text-gray-500 mb-8">Isi saldo untuk memesan makanan</p>

      {/* Current Balance */}
      <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FiDollarSign size={20} />
          </div>
          <span className="text-sm font-medium opacity-90">Saldo Saat Ini</span>
        </div>
        <p className="text-3xl font-bold">
          {user ? formatRupiah(user.balance) : "..."}
        </p>
      </div>

      <form onSubmit={handleTopUp}>
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        {/* Quick amounts */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Nominal
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TOPUP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount("");
                }}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  amount === amt
                    ? "border-orange-600 bg-orange-50 text-orange-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {formatRupiah(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atau Masukkan Jumlah Lain
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(0);
            }}
            placeholder="Contoh: 75000"
            min="1000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (!amount && !customAmount)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          <FiPlus size={20} />
          {loading
            ? "Memproses..."
            : `Top Up ${formatRupiah(amount || parseFloat(customAmount) || 0)}`}
        </button>
      </form>
    </div>
  );
}
