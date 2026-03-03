"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdOutlineRestaurant, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { HiArrowRight } from "react-icons/hi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/menu");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-green-700/40" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-green-900/50" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-green-700/30" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <MdOutlineRestaurant size={20} className="text-white" />
            </div>
            E-Canteen
          </Link>
        </div>

        {/* Center illustration area */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8">
          <div className="relative w-52 h-52">
            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-4 rounded-full bg-white/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MdOutlineRestaurant size={80} className="text-white/80" />
            </div>
            <div className="absolute -top-3 -right-3 bg-amber-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Hemat & Praktis
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white text-green-800 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Order Mudah
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Selamat Datang<br />di E-Canteen
            </h2>
            <p className="mt-3 text-green-200 text-sm leading-relaxed max-w-xs">
              Pesan makanan dan minuman favoritmu dengan mudah, cepat, dan tanpa antri.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {["🍱 Menu Lengkap", "⚡ Order Cepat", "💳 Bayar Mudah"].map((f) => (
              <span key={f} className="px-4 py-1.5 bg-white/15 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-green-300 text-xs text-center">
            © 2026 E-Canteen · All rights reserved
          </p>
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-green-800">
              <MdOutlineRestaurant size={24} />
              E-Canteen
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-800">Masuk Akun</h1>
            <p className="mt-1 text-stone-400 text-sm">Silakan masuk untuk melanjutkan</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                <span className="shrink-0">⚠</span>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Email</label>
              <div className="relative">
                <MdEmail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-stone-800 placeholder:text-stone-300 text-sm"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Password</label>
              <div className="relative">
                <MdLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-stone-800 placeholder:text-stone-300 text-sm"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-green-700/25 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <HiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">atau</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <p className="text-center text-sm text-stone-500">
            Belum punya akun?{" "}
            <Link href="/register" className="text-green-700 font-semibold hover:text-green-800 hover:underline underline-offset-2 transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

