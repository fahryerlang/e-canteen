"use client";

import { useEffect, useState, FormEvent } from "react";
import { FiUser, FiMail, FiLock, FiSave, FiCheck, FiX, FiShoppingCart, FiStar, FiHeart, FiCalendar } from "react-icons/fi";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
  _count: { orders: number; reviews: number; favorites: number };
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data);
          setName(data.name);
          setEmail(data.email);
        }
        setLoading(false);
      });
  }, []);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setProfile((p) => p ? { ...p, name: data.name, email: data.email } : p);
      setSuccess("Profil berhasil diperbarui!");
    } catch {
      setError("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password minimal 4 karakter");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  };

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <h1 className="text-2xl font-bold text-stone-900">Profil & Pengaturan</h1>
        <p className="text-stone-400 mt-1 text-sm">Kelola informasi akun Anda</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
          <FiX size={16} className="shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
          <FiCheck size={16} className="shrink-0" />{success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Summary */}
        <div className="space-y-5">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-linear-to-br from-green-500 to-green-700 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
              {profile?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <p className="text-lg font-bold text-stone-800">{profile?.name}</p>
            <p className="text-sm text-stone-400">{profile?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <FiUser size={12} /> Pengguna
            </div>
          </div>

          {/* Stats Mini */}
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <FiShoppingCart size={14} /> Pesanan
              </div>
              <span className="text-sm font-bold text-stone-800">{profile?._count.orders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <FiStar size={14} /> Ulasan
              </div>
              <span className="text-sm font-bold text-stone-800">{profile?._count.reviews ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <FiHeart size={14} /> Favorit
              </div>
              <span className="text-sm font-bold text-stone-800">{profile?._count.favorites ?? 0}</span>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <FiCalendar size={14} /> Bergabung
              </div>
              <span className="text-xs text-stone-500">{profile?.createdAt ? formatDate(profile.createdAt) : "-"}</span>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-linear-to-br from-green-700 to-emerald-800 rounded-2xl p-5 text-white">
            <p className="text-green-200 text-xs font-medium">Saldo</p>
            <p className="text-2xl font-bold mt-1">{formatRp(profile?.balance ?? 0)}</p>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Edit Profile */}
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <h2 className="text-base font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <FiUser size={16} className="text-green-600" /> Informasi Profil
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FiSave size={15} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <h2 className="text-base font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <FiLock size={16} className="text-green-600" /> Ubah Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Password Saat Ini</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    placeholder="Masukkan password saat ini"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Password Baru</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    placeholder="Masukkan password baru"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Konfirmasi Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FiLock size={15} /> {saving ? "Menyimpan..." : "Ubah Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
