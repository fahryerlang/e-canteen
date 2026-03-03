"use client";

import { useState, useEffect, FormEvent } from "react";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck } from "react-icons/fi";
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
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
          className="flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-xl hover:bg-green-800 transition-colors font-medium text-sm"
        >
          <FiPlus size={18} />
          Tambah Menu
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-stone-900">
                {editingId ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800"
                  placeholder="Contoh: Nasi Goreng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800"
                  placeholder="Contoh: 15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  URL Foto (opsional)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-stone-800"
                  placeholder="https://example.com/foto.jpg"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="w-4 h-4 text-green-700 border-stone-300 rounded focus:ring-green-600"
                />
                <label
                  htmlFor="available"
                  className="text-sm font-medium text-stone-700"
                >
                  Tersedia
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
              >
                {editingId ? "Simpan Perubahan" : "Tambah Menu"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu List */}
      {menus.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg">Belum ada menu. Tambahkan menu pertama!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-4 text-sm font-medium text-stone-400">
                    Menu
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-stone-400">
                    Harga
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-stone-400">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-stone-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                          {menu.image ? (
                            <img
                              src={menu.image}
                              alt={menu.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <MdOutlineRestaurant className="text-green-300" size={28} />
                          )}
                        </div>
                        <span className="font-medium text-stone-800 text-sm">
                          {menu.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-700 font-medium text-sm">
                      {formatRupiah(menu.price)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(menu)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                          menu.available
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {menu.available ? (
                          <>
                            <FiCheck size={12} />
                            Tersedia
                          </>
                        ) : (
                          <>
                            <FiX size={12} />
                            Habis
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(menu)}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={16} />
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
    </div>
  );
}
