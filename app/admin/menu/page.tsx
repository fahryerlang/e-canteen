"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiFileText, FiImage, FiUpload, FiFilter, FiSearch } from "react-icons/fi";
import { MdOutlineRestaurant, MdStorefront } from "react-icons/md";

interface CanteenOption {
  id: number;
  name: string;
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  category: string;
  description: string | null;
  canteenId: number | null;
  canteen: { id: number; name: string } | null;
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [canteens, setCanteens] = useState<CanteenOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<number[]>([]);
  const [previewImageError, setPreviewImageError] = useState(false);
  const [filterCanteenId, setFilterCanteenId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    available: true,
    canteenId: "",
    category: "MAKANAN",
    description: "",
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

  const fetchCanteens = () => {
    fetch("/api/canteens")
      .then((res) => res.json())
      .then((data) => setCanteens(data.map((c: CanteenOption) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  };

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchMenus();
    fetchCanteens();
    fetchCategories();
  }, []);

  const getCategoryLabel = (slug: string) => {
    return categories.find((c) => c.slug === slug)?.name || slug;
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", image: "", available: true, canteenId: "", category: "MAKANAN", description: "" });
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
      canteenId: menu.canteenId?.toString() || "",
      category: menu.category || "MAKANAN",
      description: menu.description || "",
    });
    setEditingId(menu.id);
    setShowForm(true);
    setPreviewImageError(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.canteenId) {
      setError("Kantin wajib dipilih");
      return;
    }

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

  const filteredMenus = menus.filter((m) => {
    if (filterCanteenId && m.canteenId !== filterCanteenId) return false;
    if (filterCategory !== "ALL" && m.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.canteen?.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Group menus by canteen
  const groupedMenus: { canteenName: string; canteenId: number | null; items: MenuItem[] }[] = [];
  const seenGroups = new Map<string, MenuItem[]>();
  for (const m of filteredMenus) {
    const key = m.canteen?.name ?? "Tanpa Kantin";
    const cId = m.canteen?.id ?? null;
    if (!seenGroups.has(key)) {
      seenGroups.set(key, []);
      groupedMenus.push({ canteenName: key, canteenId: cId, items: seenGroups.get(key)! });
    }
    seenGroups.get(key)!.push(m);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Kelola Menu</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {menus.length} menu terdaftar
            {canteens.length > 0 && ` \u00b7 ${canteens.length} kantin`}
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

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari menu atau kantin..."
          className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Canteen Filter Tabs */}
      {canteens.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mr-1">
            <FiFilter size={13} />
            Kantin:
          </div>
          <button
            onClick={() => setFilterCanteenId(null)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCanteenId === null
                ? "bg-green-700 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            Semua Kantin
          </button>
          {canteens.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCanteenId(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCanteenId === c.id
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory("ALL")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterCategory === "ALL"
              ? "bg-stone-800 text-white shadow-sm"
              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
          }`}
        >
          <MdOutlineRestaurant size={14} />
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setFilterCategory(cat.slug)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === cat.slug
                ? "bg-stone-800 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center shrink-0">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <FiX size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Canteen Selector */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Kantin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdStorefront size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <select
                    value={formData.canteenId}
                    onChange={(e) => setFormData({ ...formData, canteenId: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800 bg-stone-50/50 appearance-none cursor-pointer"
                  >
                    <option value="">Pilih Kantin...</option>
                    {canteens.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Nama Menu <span className="text-red-500">*</span>
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
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.slug })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors border ${
                        formData.category === cat.slug
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Harga <span className="text-red-500">*</span>
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
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800 bg-stone-50/50 placeholder:text-stone-300 resize-none text-sm"
                  rows={2}
                  placeholder="Deskripsi singkat menu (opsional)"
                />
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

      {/* Active filter indicator */}
      {(searchQuery || filterCategory !== "ALL") && (
        <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5">
          <span className="text-xs text-stone-500">
            Menampilkan <span className="font-semibold text-stone-700">{filteredMenus.length}</span> menu
            {searchQuery && <> untuk &ldquo;<span className="font-semibold text-stone-700">{searchQuery}</span>&rdquo;</>}
            {filterCategory !== "ALL" && <> di kategori <span className="font-semibold text-stone-700">{getCategoryLabel(filterCategory)}</span></>}
          </span>
          <button onClick={() => { setSearchQuery(""); setFilterCanteenId(null); setFilterCategory("ALL"); }} className="text-xs text-green-700 font-medium hover:underline">
            Reset Filter
          </button>
        </div>
      )}

      {/* Menu List */}
      {filteredMenus.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFileText className="text-stone-300" size={32} />
          </div>
          <p className="text-lg font-medium text-stone-600">
            {searchQuery ? "Menu tidak ditemukan" : filterCanteenId ? "Tidak ada menu di kantin ini" : "Belum ada menu"}
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {searchQuery
              ? "Coba kata kunci lain"
              : filterCanteenId
                ? "Tambahkan menu untuk kantin ini"
                : "Tambahkan menu pertama untuk mulai berjualan"}
          </p>
          <button
            onClick={() => {
              resetForm();
              if (filterCanteenId) {
                setFormData((prev) => ({ ...prev, canteenId: filterCanteenId.toString() }));
              }
              setShowForm(true);
            }}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus size={16} />
            Tambah Menu
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedMenus.map(({ canteenName, items: groupItems }) => (
            <div key={canteenName}>
              {/* Canteen group header */}
              {groupedMenus.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  <MdStorefront className="text-green-700" size={18} />
                  <h2 className="text-sm font-semibold text-stone-700">{canteenName}</h2>
                  <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {groupItems.length} menu
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupItems.map((menu) => (
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
                      {/* Canteen badge on card */}
                      {menu.canteen && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-stone-700 text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <MdStorefront size={11} />
                          {menu.canteen.name}
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-stone-600 text-[10px] font-semibold px-2 py-1 rounded-lg shadow-sm">
                        {getCategoryLabel(menu.category)}
                      </div>
                      {/* Hover overlay */}
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
                      <p className="text-green-700 font-bold text-sm mb-1">
                        {formatRupiah(menu.price)}
                      </p>
                      <span className="inline-block text-[10px] font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full mb-3">
                        {getCategoryLabel(menu.category)}
                      </span>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
