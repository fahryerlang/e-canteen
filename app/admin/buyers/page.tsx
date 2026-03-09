"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiDollarSign,
  FiShoppingCart,
  FiEye,
  FiX,
  FiStar,
  FiHeart,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";

interface Buyer {
  id: number;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  totalOrders: number;
  totalReviews: number;
  totalFavorites: number;
  totalSpent: number;
}

interface BuyerDetail {
  id: number;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  _count: { orders: number; reviews: number; favorites: number };
  orders: { id: number; totalPrice: number; status: string; createdAt: string; pickupTime: string }[];
  transactions: { id: number; type: string; amount: number; status: string; createdAt: string; note: string | null }[];
}

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", balance: "" });
  const [detailBuyer, setDetailBuyer] = useState<BuyerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBuyers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    const res = await fetch(`/api/admin/buyers?${params}`);
    if (res.ok) setBuyers(await res.json());
    setLoading(false);
  }, [search, sort]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const openEdit = (b: Buyer) => {
    setEditingBuyer(b);
    setEditForm({ name: b.name, email: b.email, balance: b.balance.toString() });
  };

  const saveEdit = async () => {
    if (!editingBuyer) return;
    const res = await fetch(`/api/admin/buyers/${editingBuyer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        balance: parseFloat(editForm.balance) || 0,
      }),
    });
    if (res.ok) {
      setEditingBuyer(null);
      fetchBuyers();
    }
  };

  const deleteBuyer = async (id: number) => {
    if (!confirm("Yakin ingin menghapus pembeli ini? Semua data pesanan dan transaksinya akan ikut terhapus.")) return;
    const res = await fetch(`/api/admin/buyers/${id}`, { method: "DELETE" });
    if (res.ok) fetchBuyers();
  };

  const viewDetail = async (id: number) => {
    setDetailLoading(true);
    const res = await fetch(`/api/admin/buyers/${id}`);
    if (res.ok) setDetailBuyer(await res.json());
    setDetailLoading(false);
  };

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusLabel = (s: string) =>
    s === "DIPROSES" ? "Diproses" : s === "SIAP_DIAMBIL" ? "Siap Diambil" : "Selesai";

  const statusBadge = (s: string) =>
    s === "DIPROSES"
      ? "bg-amber-100 text-amber-700"
      : s === "SIAP_DIAMBIL"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  const txBadge = (type: string) =>
    type === "TOPUP" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  const totalBalance = buyers.reduce((s, b) => s + b.balance, 0);
  const totalSpentAll = buyers.reduce((s, b) => s + b.totalSpent, 0);
  const totalOrdersAll = buyers.reduce((s, b) => s + b.totalOrders, 0);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-stone-50">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Kelola Pembeli</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Pembeli", value: buyers.length, icon: <FiUsers size={18} />, color: "text-stone-600 bg-stone-100" },
          { label: "Total Saldo", value: formatRp(totalBalance), icon: <FiDollarSign size={18} />, color: "text-green-600 bg-green-50" },
          { label: "Total Belanja", value: formatRp(totalSpentAll), icon: <FiShoppingCart size={18} />, color: "text-blue-600 bg-blue-50" },
          { label: "Total Pesanan", value: totalOrdersAll, icon: <FiShoppingCart size={18} />, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-xl font-bold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama atau email pembeli..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
        >
          <option value="newest">Terbaru</option>
          <option value="name">Nama A-Z</option>
          <option value="balance-high">Saldo Terbanyak</option>
          <option value="balance-low">Saldo Tersedikit</option>
        </select>
      </div>

      {/* Table */}
      {!loading && buyers.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <FiUsers className="mx-auto mb-3" size={40} />
          <p>Tidak ada pembeli ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left px-5 py-3 font-medium text-stone-500">Pembeli</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500">Saldo</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500 hidden md:table-cell">Pesanan</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500 hidden lg:table-cell">Total Belanja</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-500 hidden lg:table-cell">Terdaftar</th>
                  <th className="text-center px-5 py-3 font-medium text-stone-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((b) => (
                  <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 truncate">{b.name}</p>
                          <p className="text-xs text-stone-400 truncate">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${b.balance > 0 ? "text-green-600" : "text-stone-400"}`}>
                        {formatRp(b.balance)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-stone-600 hidden md:table-cell">{b.totalOrders}</td>
                    <td className="px-5 py-3 text-right text-stone-600 hidden lg:table-cell">{formatRp(b.totalSpent)}</td>
                    <td className="px-5 py-3 text-stone-500 hidden lg:table-cell">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => viewDetail(b.id)}
                          className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteBuyer(b.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {(detailBuyer || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Detail Pembeli</h2>
              <button
                onClick={() => setDetailBuyer(null)}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16 text-stone-400">
                Memuat...
              </div>
            ) : detailBuyer ? (
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl">
                    {detailBuyer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">{detailBuyer.name}</h3>
                    <p className="text-sm text-stone-400">{detailBuyer.email}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Terdaftar {formatDate(detailBuyer.createdAt)}</p>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Saldo", value: formatRp(detailBuyer.balance), icon: <FiDollarSign size={14} />, color: "text-green-600 bg-green-50" },
                    { label: "Pesanan", value: detailBuyer._count.orders, icon: <FiShoppingCart size={14} />, color: "text-blue-600 bg-blue-50" },
                    { label: "Ulasan", value: detailBuyer._count.reviews, icon: <FiStar size={14} />, color: "text-amber-600 bg-amber-50" },
                    { label: "Favorit", value: detailBuyer._count.favorites, icon: <FiHeart size={14} />, color: "text-red-600 bg-red-50" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-stone-100 p-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${s.color}`}>{s.icon}</div>
                      <p className="text-lg font-bold text-stone-800">{s.value}</p>
                      <p className="text-[11px] text-stone-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="text-sm font-semibold text-stone-700 mb-3">Pesanan Terakhir</h4>
                  {detailBuyer.orders.length === 0 ? (
                    <p className="text-sm text-stone-400 py-4 text-center">Belum ada pesanan</p>
                  ) : (
                    <div className="space-y-2">
                      {detailBuyer.orders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <div>
                            <span className="text-sm font-medium text-stone-700">Pesanan #{o.id}</span>
                            <p className="text-xs text-stone-400">{formatDateTime(o.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadge(o.status)}`}>
                              {statusLabel(o.status)}
                            </span>
                            <span className="text-sm font-semibold text-stone-700">{formatRp(o.totalPrice)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="text-sm font-semibold text-stone-700 mb-3">Transaksi Terakhir</h4>
                  {detailBuyer.transactions.length === 0 ? (
                    <p className="text-sm text-stone-400 py-4 text-center">Belum ada transaksi</p>
                  ) : (
                    <div className="space-y-2">
                      {detailBuyer.transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.type === "TOPUP" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                              {t.type === "TOPUP" ? <FiArrowDown size={14} /> : <FiArrowUp size={14} />}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-stone-700">{t.type === "TOPUP" ? "Top Up" : "Pembayaran"}</span>
                              {t.note && <p className="text-[11px] text-stone-400">{t.note}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-semibold ${t.type === "TOPUP" ? "text-green-600" : "text-red-600"}`}>
                              {t.type === "TOPUP" ? "+" : "-"}{formatRp(t.amount)}
                            </span>
                            <p className="text-[10px] text-stone-400">{formatDateTime(t.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Edit Pembeli</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nama</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Saldo (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingBuyer(null)}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
