"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiFileText, FiImage, FiUpload } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<number[]>([]);
  const [previewImageError, setPreviewImageError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    available: true,
  });
  const [error, setError] = useState("");

  const fetchMenus = () => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenus(data);
        setBrokenImageIds([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", price: "", image: "", available: true });
    setEditingId(null);
    setShowForm(false);
    setError("");
    setPreviewImageError(false);
  };

  const handleEdit = (menu: MenuItem) => {
    setFormData({
      name: menu.name,
      price: menu.price.toString(),
      image: menu.image || "",
      available: menu.available,
    });
    setEditingId(menu.id);
    setShowForm(true);
    setPreviewImageError(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const url = editingId ? `/api/menu/${editingId}` : "/api/menu";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan menu");
        return;
      }

      resetForm();
      fetchMenus();
    } catch {
      setError("Terjadi kesalahan");
    }
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setFormData((prev) => ({ ...prev, image: result }));
        setPreviewImageError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    try {
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
      fetchMenus();
    } catch {
      alert("Gagal menghapus menu");
    }
  };

  const toggleAvailability = async (menu: MenuItem) => {
    try {
      await fetch(`/api/menu/${menu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !menu.available }),
      });
      fetchMenus();
    } catch {
      alert("Gagal mengubah status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Kelola Menu</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {menus.length} menu terdaftar
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-linear-to-r from-green-600 to-green-700 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-green-600/20 hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm"
        >
          <FiPlus size={18} />
          Tambah Menu
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                onClick={resetForm}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <FiX size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nama Menu
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800 bg-stone-50/50 placeholder:text-stone-300"
                  placeholder="Contoh: Nasi Goreng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Harga
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">Rp</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800 bg-stone-50/50 placeholder:text-stone-300"
                    placeholder="15000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Foto Menu
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <FiImage size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setPreviewImageError(false);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800 text-sm bg-stone-50/50 placeholder:text-stone-300"
                      placeholder="Tempel link gambar..."
                    />
                  </div>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-200 hover:border-green-400 hover:bg-green-50/30 rounded-xl py-3 cursor-pointer transition-colors text-sm text-stone-500">
                    <FiUpload size={16} />
                    Upload dari perangkat
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.image && !previewImageError && (
                  <div className="mt-3 rounded-xl border border-stone-200 overflow-hidden bg-stone-50 relative group">
                    <img
                      src={formData.image}
                      alt="Preview foto menu"
                      className="w-full h-40 object-cover"
                      onError={() => setPreviewImageError(true)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: "" });
                        setPreviewImageError(false);
                      }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
                {formData.image && previewImageError && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs px-3 py-2">
                    Gambar tidak bisa dimuat. Pastikan link mengarah langsung ke file gambar publik.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                </label>
                <label
                  htmlFor="available"
                  className="text-sm font-medium text-stone-700"
                >
                  Tersedia untuk dipesan
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-600/20 transition-all duration-300"
              >
                {editingId ? "Simpan Perubahan" : "Tambah Menu"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu List */}
      {menus.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFileText className="text-stone-300" size={32} />
          </div>
          <p className="text-lg font-medium text-stone-600">Belum ada menu</p>
          <p className="text-sm text-stone-400 mt-1">Tambahkan menu pertama untuk mulai berjualan</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus size={16} />
            Tambah Menu Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`group bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
                menu.available
                  ? "border-stone-100 hover:shadow-lg hover:shadow-stone-200/50"
                  : "border-stone-100 opacity-75"
              }`}
            >
              <div className="h-44 bg-linear-to-br from-stone-50 to-stone-100 flex items-center justify-center relative overflow-hidden">
                {menu.image && !brokenImageIds.includes(menu.id) ? (
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() =>
                      setBrokenImageIds((prev) =>
                        prev.includes(menu.id) ? prev : [...prev, menu.id]
                      )
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <MdOutlineRestaurant className="text-stone-200" size={48} />
                    <span className="text-xs text-stone-300">Tidak ada foto</span>
                  </div>
                )}
                {!menu.available && (
                  <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Habis</span>
                  </div>
                )}
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="font-semibold text-stone-900 text-base leading-snug">
                    {menu.name}
                  </h3>
                  <button
                    onClick={() => toggleAvailability(menu)}
                    className={`shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
                      menu.available
                        ? "bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-100"
                    }`}
                  >
                    {menu.available ? (
                      <>
                        <FiCheck size={11} />
                        Tersedia
                      </>
                    ) : (
                      <>
                        <FiX size={11} />
                        Habis
                      </>
                    )}
                  </button>
                </div>
                <p className="text-green-700 font-bold text-sm mb-3">
                  {formatRupiah(menu.price)}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => handleEdit(menu)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit menu"
                  >
                    <FiEdit size={14} />
                    Edit
                  </button>
                  <div className="w-px h-5 bg-stone-100" />
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Hapus menu"
                  >
                    <FiTrash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
