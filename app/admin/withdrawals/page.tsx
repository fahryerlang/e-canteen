"use client";

import { useState, useEffect } from "react";
import { FiSend, FiClock, FiCheckCircle, FiXCircle, FiFilter } from "react-icons/fi";
import { formatRupiah } from "@/lib/utils";

interface WithdrawalData {
  id: number;
  amount: number;
  note: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  seller: {
    id: number;
    name: string;
    email: string;
    canteen: { name: string } | null;
  };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchData = (status?: string) => {
    const query = status ? `?status=${status}` : "";
    fetch(`/api/admin/withdrawals${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWithdrawals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(filter || undefined);
  }, [filter]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchData(filter || undefined);
      }
    } catch {
      // ignore
    } finally {
      setProcessing(null);
    }
  };

  const statusConfig = {
    PENDING: { label: "Menunggu", icon: <FiClock size={14} />, color: "bg-amber-50 text-amber-600" },
    APPROVED: { label: "Disetujui", icon: <FiCheckCircle size={14} />, color: "bg-emerald-50 text-emerald-600" },
    REJECTED: { label: "Ditolak", icon: <FiXCircle size={14} />, color: "bg-red-50 text-red-600" },
  };

  const pendingCount = withdrawals.filter((w) => w.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <FiSend className="text-green-600" />
            Permintaan Setoran
            {pendingCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {pendingCount} baru
              </span>
            )}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kelola permintaan setoran saldo dari penjual
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <FiFilter size={14} className="text-stone-400" />
        {["", "PENDING", "APPROVED", "REJECTED"].map((val) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === val
                ? "bg-green-600 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {val === "" ? "Semua" : val === "PENDING" ? "Menunggu" : val === "APPROVED" ? "Disetujui" : "Ditolak"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {!loading && withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <FiSend size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">Tidak ada permintaan setoran</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {withdrawals.map((w) => {
              const cfg = statusConfig[w.status];
              return (
                <div key={w.id} className="px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        w.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-600"
                          : w.status === "PENDING"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <FiSend size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">
                        {w.seller.name}
                        {w.seller.canteen && (
                          <span className="ml-2 text-xs font-normal text-stone-400">
                            ({w.seller.canteen.name})
                          </span>
                        )}
                      </p>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {formatRupiah(w.amount)}
                      </p>
                      {w.note && (
                        <p className="text-xs text-stone-400 mt-0.5">Catatan: {w.note}</p>
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

                  <div className="flex items-center gap-2">
                    {w.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleAction(w.id, "approve")}
                          disabled={processing === w.id}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          <FiCheckCircle size={12} />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleAction(w.id, "reject")}
                          disabled={processing === w.id}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          <FiXCircle size={12} />
                          Tolak
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
