"use client";

import { useState, useEffect, FormEvent } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTag, FiAlertCircle } from "react-icons/fi";

interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

const EMPTY_FORM = { name: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [menuCounts, setMenuCounts] = useState<Record<string, number>>({});

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuCounts = async () => {
    try {
      const res = await fetch("/api/menu");
      const menus: { category: string }[] = await res.json();
      const counts: Record<string, number> = {};
      for (const m of menus) {
        counts[m.category] = (counts[m.category] || 0) + 1;
      }
      setMenuCounts(counts);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuCounts();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editTarget
      ? `/api/admin/categories/${editTarget.id}`
      : "/api/admin/categories";
    const method = editTarget ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        setSaving(false);
        return;
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const count = menuCounts[cat.slug] || 0;
    if (count > 0) {
      alert(`Tidak dapat menghapus kategori "${cat.name}" karena masih digunakan oleh ${count} menu.`);
      return;
    }
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;

    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal menghapus");
      } else {
        fetchCategories();
      }
    } catch {
      alert("Gagal menghapus kategori");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Kelola Kategori</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {categories.length} kategori terdaftar
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-linear-to-r from-green-600 to-green-700 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-green-600/20 hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm"
        >
          <FiPlus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-32" />
                  <div className="h-3 bg-stone-100 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiTag className="text-stone-300" size={32} />
          </div>
          <p className="text-lg font-medium text-stone-600">Belum ada kategori</p>
          <p className="text-sm text-stone-400 mt-1">
            Tambahkan kategori untuk mengorganisir menu
          </p>
          <button
            onClick={openAdd}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus size={16} />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const count = menuCounts[cat.slug] || 0;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <FiTag className="text-green-700" size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 text-base">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md">
                        {cat.slug}
                      </span>
                      <span className="text-xs text-stone-400">
                        {count} menu
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit kategori"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Hapus kategori"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {editTarget ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <FiAlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800 bg-stone-50/50 placeholder:text-stone-300"
                  placeholder="Contoh: Makanan"
                />
                {form.name.trim() && (
                  <p className="text-xs text-stone-400 mt-1.5">
                    Slug: <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                      {form.name.trim().toUpperCase().replace(/\s+/g, "_")}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-600/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <FiCheck size={16} />
                      {editTarget ? "Simpan Perubahan" : "Tambah Kategori"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
