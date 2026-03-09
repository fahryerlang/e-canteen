"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiDollarSign,
  FiSend,
} from "react-icons/fi";
import { MdStorefront, MdOutlineRestaurant } from "react-icons/md";

interface Canteen {
  id: number;
  name: string;
}

interface Seller {
  id: number;
  name: string;
  email: string;
  balance: number;
  canteen: Canteen | null;
  createdAt: string;
  totalWithdrawals: number;
  totalMenus: number;
}

interface SellerDetail {
  id: number;
  name: string;
  email: string;
  balance: number;
  canteen: Canteen | null;
  canteenId: number | null;
  createdAt: string;
  _count: { withdrawals: number };
  withdrawals: { id: number; amount: number; status: string; note: string | null; createdAt: string }[];
  menus: { id: number; name: string; price: number; available: boolean; category: string }[];
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", canteenId: "" });
  const [detailSeller, setDetailSeller] = useState<SellerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSellers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    const res = await fetch(`/api/admin/sellers?${params}`);
    if (res.ok) setSellers(await res.json());
    setLoading(false);
  }, [search, sort]);

  useEffect(() => {
    fetchSellers();
    fetch("/api/canteens").then((r) => (r.ok ? r.json() : [])).then(setCanteens);
  }, [fetchSellers]);

  const openEdit = (s: Seller) => {
    setEditingSeller(s);
    setEditForm({ name: s.name, email: s.email, canteenId: s.canteen?.id?.toString() || "" });
  };

  const saveEdit = async () => {
    if (!editingSeller) return;
    const res = await fetch(`/api/admin/sellers/${editingSeller.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingSeller(null);
      fetchSellers();
    }
  };

  const deleteSeller = async (id: number) => {
    if (!confirm("Yakin ingin menghapus penjual ini?")) return;
    const res = await fetch(`/api/admin/sellers/${id}`, { method: "DELETE" });
    if (res.ok) fetchSellers();
  };

  const viewDetail = async (id: number) => {
    setDetailLoading(true);
    const res = await fetch(`/api/admin/sellers/${id}`);
    if (res.ok) setDetailSeller(await res.json());
    setDetailLoading(false);
  };

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const wdBadge = (s: string) =>
    s === "PENDING" ? "bg-amber-100 text-amber-700" : s === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  const wdLabel = (s: string) =>
    s === "PENDING" ? "Pending" : s === "APPROVED" ? "Disetujui" : "Ditolak";

  const categoryLabel = (c: string) =>
    c === "MAKANAN" ? "Makanan" : c === "MINUMAN" ? "Minuman" : "Snack";

  const totalBalance = sellers.reduce((s, b) => s + b.balance, 0);
  const totalMenus = sellers.reduce((s, b) => s + b.totalMenus, 0);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-stone-50">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Kelola Penjual</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Penjual", value: sellers.length, icon: <MdStorefront size={18} />, color: "text-stone-600 bg-stone-100" },
          { label: "Total Saldo", value: formatRp(totalBalance), icon: <FiDollarSign size={18} />, color: "text-green-600 bg-green-50" },
          { label: "Total Menu", value: totalMenus, icon: <MdOutlineRestaurant size={18} />, color: "text-blue-600 bg-blue-50" },
          { label: "Punya Kantin", value: sellers.filter((s) => s.canteen).length, icon: <MdStorefront size={18} />, color: "text-purple-600 bg-purple-50" },
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
            placeholder="Cari nama atau email penjual..."
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
      {!loading && sellers.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <MdStorefront className="mx-auto mb-3" size={40} />
          <p>Tidak ada penjual ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left px-5 py-3 font-medium text-stone-500">Penjual</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-500 hidden md:table-cell">Kantin</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500">Saldo</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500 hidden md:table-cell">Menu</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500 hidden lg:table-cell">Setoran</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-500 hidden lg:table-cell">Terdaftar</th>
                  <th className="text-center px-5 py-3 font-medium text-stone-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 truncate">{s.name}</p>
                          <p className="text-xs text-stone-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      {s.canteen ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          <MdStorefront size={12} /> {s.canteen.name}
                        </span>
                      ) : (
                        <span className="text-stone-300 text-xs">Belum ada</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${s.balance > 0 ? "text-green-600" : "text-stone-400"}`}>
                        {formatRp(s.balance)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-stone-600 hidden md:table-cell">{s.totalMenus}</td>
                    <td className="px-5 py-3 text-right text-stone-600 hidden lg:table-cell">{s.totalWithdrawals}</td>
                    <td className="px-5 py-3 text-stone-500 hidden lg:table-cell">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => viewDetail(s.id)}
                          className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteSeller(s.id)}
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
      {(detailSeller || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Detail Penjual</h2>
              <button
                onClick={() => setDetailSeller(null)}
                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16 text-stone-400">Memuat...</div>
            ) : detailSeller ? (
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                    {detailSeller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">{detailSeller.name}</h3>
                    <p className="text-sm text-stone-400">{detailSeller.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {detailSeller.canteen && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                          <MdStorefront size={11} /> {detailSeller.canteen.name}
                        </span>
                      )}
                      <span className="text-xs text-stone-400">Terdaftar {formatDate(detailSeller.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Saldo", value: formatRp(detailSeller.balance), icon: <FiDollarSign size={14} />, color: "text-green-600 bg-green-50" },
                    { label: "Menu", value: detailSeller.menus.length, icon: <MdOutlineRestaurant size={14} />, color: "text-blue-600 bg-blue-50" },
                    { label: "Setoran", value: detailSeller._count.withdrawals, icon: <FiSend size={14} />, color: "text-purple-600 bg-purple-50" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-stone-100 p-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${s.color}`}>{s.icon}</div>
                      <p className="text-lg font-bold text-stone-800">{s.value}</p>
                      <p className="text-[11px] text-stone-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Menu Items */}
                <div>
                  <h4 className="text-sm font-semibold text-stone-700 mb-3">Menu Terdaftar</h4>
                  {detailSeller.menus.length === 0 ? (
                    <p className="text-sm text-stone-400 py-4 text-center">Belum ada menu</p>
                  ) : (
                    <div className="space-y-2">
                      {detailSeller.menus.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <div>
                            <span className="text-sm font-medium text-stone-700">{m.name}</span>
                            <p className="text-xs text-stone-400">{categoryLabel(m.category)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${m.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {m.available ? "Tersedia" : "Habis"}
                            </span>
                            <span className="text-sm font-semibold text-stone-700">{formatRp(m.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Withdrawals */}
                <div>
                  <h4 className="text-sm font-semibold text-stone-700 mb-3">Setoran Terakhir</h4>
                  {detailSeller.withdrawals.length === 0 ? (
                    <p className="text-sm text-stone-400 py-4 text-center">Belum ada setoran</p>
                  ) : (
                    <div className="space-y-2">
                      {detailSeller.withdrawals.map((w) => (
                        <div key={w.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          <div>
                            <span className="text-sm font-medium text-stone-700">Setoran #{w.id}</span>
                            {w.note && <p className="text-[11px] text-stone-400">{w.note}</p>}
                            <p className="text-xs text-stone-400">{formatDateTime(w.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${wdBadge(w.status)}`}>
                              {wdLabel(w.status)}
                            </span>
                            <span className="text-sm font-semibold text-stone-700">{formatRp(w.amount)}</span>
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
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Edit Penjual</h2>
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
                <label className="block text-xs font-medium text-stone-500 mb-1">Kantin</label>
                <select
                  value={editForm.canteenId}
                  onChange={(e) => setEditForm({ ...editForm, canteenId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="">Tidak ada</option>
                  {canteens.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSeller(null)}
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
