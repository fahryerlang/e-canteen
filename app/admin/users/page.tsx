"use client";

import { useEffect, useState, useCallback } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiUsers, FiShield, FiShoppingCart } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

interface Canteen {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  balance: number;
  canteenId: number | null;
  canteen: Canteen | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", canteenId: "" });

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
    fetch("/api/canteens").then(r => r.ok ? r.json() : []).then(setCanteens);
  }, [fetchUsers]);

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, canteenId: u.canteenId?.toString() || "" });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    const res = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingUser(null);
      fetchUsers();
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  const roleLabel = (r: string) => (r === "ADMIN" ? "Admin" : r === "SELLER" ? "Penjual" : "Pengguna");
  const roleBadge = (r: string) =>
    r === "ADMIN"
      ? "bg-purple-100 text-purple-700"
      : r === "SELLER"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";
  const roleIcon = (r: string) =>
    r === "ADMIN" ? <FiShield size={13} /> : r === "SELLER" ? <MdStorefront size={13} /> : <FiShoppingCart size={13} />;

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === "ADMIN").length,
    seller: users.filter(u => u.role === "SELLER").length,
    user: users.filter(u => u.role === "USER").length,
  };

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-stone-50 in-[.sidebar-closed]:pl-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Kelola Pengguna</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: <FiUsers />, color: "text-stone-600 bg-stone-100" },
          { label: "Admin", value: stats.admin, icon: <FiShield />, color: "text-purple-600 bg-purple-50" },
          { label: "Penjual", value: stats.seller, icon: <MdStorefront />, color: "text-blue-600 bg-blue-50" },
          { label: "Pengguna", value: stats.user, icon: <FiShoppingCart />, color: "text-green-600 bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-stone-800">{s.value}</p>
            <p className="text-xs text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
        >
          <option value="">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="SELLER">Penjual</option>
          <option value="USER">Pengguna</option>
        </select>
      </div>

      {/* Users Table */}
      {!loading && users.length === 0 ? (
        <div className="text-center py-20 text-stone-400">Tidak ada pengguna ditemukan</div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-left px-5 py-3 font-medium text-stone-500">Nama</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-500">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-500">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-500">Kantin</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500">Saldo</th>
                  <th className="text-right px-5 py-3 font-medium text-stone-500">Pesanan</th>
                  <th className="text-center px-5 py-3 font-medium text-stone-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-stone-800">{u.name}</td>
                    <td className="px-5 py-3 text-stone-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>
                        {roleIcon(u.role)} {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{u.canteen?.name || "-"}</td>
                    <td className="px-5 py-3 text-right font-medium text-stone-700">{formatRp(u.balance)}</td>
                    <td className="px-5 py-3 text-right text-stone-500">{u._count.orders}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Edit Pengguna</h2>
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
                <label className="block text-xs font-medium text-stone-500 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SELLER">Penjual</option>
                  <option value="USER">Pengguna</option>
                </select>
              </div>
              {editForm.role === "SELLER" && (
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
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
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
