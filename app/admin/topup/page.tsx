"use client";

import { useEffect, useState, useCallback } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiFilter } from "react-icons/fi";

interface TopUpRequest {
  id: number;
  userId: number;
  amount: number;
  note: string | null;
  status: string;
  createdAt: string;
  user: { id: number; name: string; email: string; balance: number };
}

export default function AdminTopUpPage() {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    const params = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/topup-requests${params}`);
    if (res.ok) setRequests(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setProcessing(id);
    const res = await fetch(`/api/admin/topup-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) fetchRequests();
    setProcessing(null);
  };

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusBadge = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-amber-100 text-amber-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-stone-100 text-stone-600";
    }
  };
  const statusLabel = (s: string) => (s === "PENDING" ? "Menunggu" : s === "APPROVED" ? "Disetujui" : "Ditolak");
  const statusIcon = (s: string) => (s === "PENDING" ? <FiClock size={13} /> : s === "APPROVED" ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />);

  const stats = {
    pending: requests.filter(r => r.status === "PENDING").length,
    totalPending: requests.filter(r => r.status === "PENDING").reduce((a, r) => a + r.amount, 0),
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-stone-50 in-[.sidebar-closed]:pl-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Permintaan Top Up</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <FiClock size={20} />
          </div>
          <p className="text-3xl font-bold text-stone-800">{stats.pending}</p>
          <p className="text-xs text-stone-400 mt-1">Permintaan menunggu</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
            <FiDollarSign size={20} />
          </div>
          <p className="text-3xl font-bold text-stone-800">{formatRp(stats.totalPending)}</p>
          <p className="text-xs text-stone-400 mt-1">Total saldo pending</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <FiFilter className="text-stone-400" />
        {["PENDING", "APPROVED", "REJECTED", ""].map((f) => (
          <button
            key={f || "ALL"}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "bg-green-600 text-white" : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f === "PENDING" ? "Menunggu" : f === "APPROVED" ? "Disetujui" : f === "REJECTED" ? "Ditolak" : "Semua"}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {!loading && requests.length === 0 ? (
        <div className="text-center py-20">
          <FiCheckCircle size={48} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-400">Tidak ada permintaan top-up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-stone-800">{r.user.name}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadge(r.status)}`}>
                    {statusIcon(r.status)} {statusLabel(r.status)}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{r.user.email}</p>
                <p className="text-xs text-stone-400">{formatDate(r.createdAt)}</p>
                {r.note && <p className="text-xs text-stone-500 mt-1 italic">{r.note}</p>}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700">{formatRp(r.amount)}</p>
                <p className="text-[11px] text-stone-400">Saldo saat ini: {formatRp(r.user.balance)}</p>
              </div>
              {r.status === "PENDING" && (
                <div className="flex gap-2 sm:flex-col">
                  <button
                    onClick={() => handleAction(r.id, "approve")}
                    disabled={processing === r.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleAction(r.id, "reject")}
                    disabled={processing === r.id}
                    className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
