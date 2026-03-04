"use client";

import { useState, useEffect, FormEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiShoppingBag, FiUsers, FiToggleRight, FiToggleLeft, FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";
import Link from "next/link";

interface CanteenMenu {
  id: number;
  name: string;
  price: number;
  available: boolean;
  image: string | null;
}

interface Canteen {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { menus: number; users: number };
  menus: CanteenMenu[];
}

const EMPTY_FORM = { name: "", description: "", isActive: true };

export default function AdminCanteensPage() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Canteen | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchCanteens = () => {
    fetch("/api/canteens")
      .then((r) => r.json())
      .then((d) => { setCanteens(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCanteens(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (c: Canteen) => {
    setEditTarget(c);
    setForm({ name: c.name, description: c.description || "", isActive: c.isActive });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = editTarget ? `/api/canteens/${editTarget.id}` : "/api/canteens";
    const method = editTarget ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Gagal menyimpan"); return; }
    setShowModal(false);
    fetchCanteens();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kantin ini? Semua menu terkait akan ikut terhapus.")) return;
    setDeletingId(id);
    await fetch(`/api/canteens/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchCanteens();
  };

  const toggleActive = async (c: Canteen) => {
    await fetch(`/api/canteens/${c.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    fetchCanteens();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Kelola Kantin</h1>
          <p className="text-stone-400 mt-1 text-sm">{canteens.length} kantin terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors font-medium text-sm"
        >
          <FiPlus size={16} /> Tambah Kantin
        </button>
      </div>

      {canteens.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <MdOutlineRestaurant size={56} className="mx-auto mb-4 text-stone-300" />
          <p className="text-lg mb-2">Belum ada kantin</p>
          <button onClick={openAdd} className="text-green-700 font-medium text-sm hover:underline">
            Tambah kantin pertama
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {canteens.map((c) => (
            <div key={c.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${!c.isActive ? "opacity-60 border-stone-200" : "border-stone-100 hover:shadow-md"}`}>
              {/* Canteen Header */}
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-32 sm:h-auto bg-linear-to-br from-green-700 to-emerald-900 flex items-center justify-center relative shrink-0">
                  <MdOutlineRestaurant className="text-white/30" size={48} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-bold text-base px-4 text-center leading-tight">{c.name}</span>
                    <span className={`mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-400/20 text-green-200" : "bg-red-400/20 text-red-200"}`}>
                      {c.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  {c.description && <p className="text-xs text-stone-500 mb-3">{c.description}</p>}

                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <FiShoppingBag size={13} /> {c._count.menus} menu
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <FiUsers size={13} /> {c._count.users} penjual
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => toggleActive(c)}
                      title={c.isActive ? "Nonaktifkan" : "Aktifkan"}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${c.isActive ? "border-green-200 text-green-700 hover:bg-green-50" : "border-stone-200 text-stone-500 hover:bg-stone-50"}`}
                    >
                      {c.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      className="flex items-center gap-1 px-3 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-xs font-medium"
                    >
                      <FiEdit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="flex items-center gap-1 px-3 py-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-xs font-medium disabled:opacity-50"
                    >
                      <FiTrash2 size={13} /> {deletingId === c.id ? "..." : "Hapus"}
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      className="flex items-center gap-1 px-3 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-xs font-medium"
                    >
                      <FiShoppingBag size={13} />
                      Lihat Menu ({c._count.menus})
                      {expandedId === c.id ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </button>
                    <Link
                      href={`/admin/menu`}
                      className="flex items-center gap-1 px-3 py-2 border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors text-xs font-medium"
                    >
                      <FiExternalLink size={13} /> Kelola Menu
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expandable Menu List */}
              {expandedId === c.id && (
                <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-3">
                  {c.menus.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4">
                      Belum ada menu di kantin ini.{" "}
                      <Link href="/admin/menu" className="text-green-700 hover:underline font-medium">
                        Tambah menu
                      </Link>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-stone-600">Daftar Menu</span>
                        <span className="text-[10px] text-stone-400">{c.menus.length} item</span>
                      </div>
                      {c.menus.map((menu) => (
                        <div key={menu.id} className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-3 py-2.5">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                            {menu.image ? (
                              <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                            ) : (
                              <MdOutlineRestaurant className="text-stone-300" size={18} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">{menu.name}</p>
                            <p className="text-xs text-green-700 font-semibold">{formatRupiah(menu.price)}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${menu.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {menu.available ? "Tersedia" : "Habis"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">{editTarget ? "Edit Kantin" : "Tambah Kantin Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nama Kantin *</label>
                <input
                  value={form.name} required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Contoh: Kantin 1 - Makanan Berat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  placeholder="Deskripsi singkat kantin"
                />
              </div>
              {editTarget && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.isActive ? "bg-green-600" : "bg-stone-300"}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <span className="text-sm text-stone-700">Kantin aktif</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-1">
                  {saving ? "Menyimpan..." : <><FiCheck size={14} /> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
