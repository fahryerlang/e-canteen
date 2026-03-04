"use client";

import { useState, useEffect, FormEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck,
  FiToggleLeft, FiToggleRight,
} from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  category: string;
  description: string | null;
}

const CATEGORIES = [
  { value: "MAKANAN", label: "Makanan" },
  { value: "MINUMAN", label: "Minuman" },
  { value: "SNACK", label: "Snack" },
];

const EMPTY_FORM = { name: "", price: "", image: "", available: true, category: "MAKANAN", description: "" };

export default function SellerMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchMenus = () => {
    fetch("/api/seller/menu")
      .then((r) => r.json())
      .then((d) => { setMenus(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (menu: MenuItem) => {
    setEditTarget(menu);
    setForm({ name: menu.name, price: String(menu.price), image: menu.image || "", available: menu.available, category: menu.category || "MAKANAN", description: menu.description || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = { name: form.name, price: parseFloat(form.price), image: form.image || null, available: form.available, category: form.category, description: form.description || null };
    const url = editTarget ? `/api/seller/menu/${editTarget.id}` : "/api/seller/menu";
    const method = editTarget ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error || "Gagal menyimpan menu"); return; }
    setShowModal(false);
    fetchMenus();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus menu ini?")) return;
    setDeletingId(id);
    await fetch(`/api/seller/menu/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchMenus();
  };

  const toggleAvailable = async (menu: MenuItem) => {
    await fetch(`/api/seller/menu/${menu.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !menu.available }),
    });
    fetchMenus();
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
      <div className="flex justify-between items-center mb-8 transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Menu Saya</h1>
          <p className="text-stone-400 mt-1 text-sm">{menus.length} produk terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors font-medium text-sm"
        >
          <FiPlus size={16} /> Tambah Menu
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <MdOutlineRestaurant size={56} className="mx-auto mb-4 text-stone-300" />
          <p className="text-lg mb-2">Belum ada menu</p>
          <button onClick={openAdd} className="text-green-700 font-medium text-sm hover:underline">
            Tambah menu pertama Anda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menus.map((menu) => (
            <div key={menu.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${!menu.available ? "opacity-60 border-stone-200" : "border-stone-100 hover:shadow-md hover:-translate-y-0.5"}`}>
              <div className="h-40 bg-linear-to-br from-green-50 to-stone-100 flex items-center justify-center relative">
                {menu.image ? (
                  <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                ) : (
                  <MdOutlineRestaurant className="text-green-200" size={56} />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => toggleAvailable(menu)}
                    title={menu.available ? "Nonaktifkan" : "Aktifkan"}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-white ${menu.available ? "bg-green-600 hover:bg-green-700" : "bg-stone-400 hover:bg-stone-500"}`}
                  >
                    {menu.available ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-stone-800 text-sm truncate flex-1">{menu.name}</h3>
                  {!menu.available && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">Habis</span>}
                </div>
                <p className="text-green-700 font-extrabold text-sm mb-3">{formatRupiah(menu.price)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(menu)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-xs font-medium"
                  >
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    disabled={deletingId === menu.id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    <FiTrash2 size={13} /> {deletingId === menu.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">{editTarget ? "Edit Menu" : "Tambah Menu Baru"}</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700 transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nama Menu *</label>
                <input
                  value={form.name} required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Contoh: Nasi Goreng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Harga (Rp) *</label>
                <input
                  type="number" min="0" required value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Contoh: 15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Kategori *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  rows={2}
                  placeholder="Deskripsi singkat menu..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">URL Gambar (opsional)</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, available: !form.available })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.available ? "bg-green-600" : "bg-stone-300"}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${form.available ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <span className="text-sm text-stone-700">Tersedia untuk dipesan</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
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
