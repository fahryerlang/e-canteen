"use client";

import Link from "next/link";
import { FiShoppingBag, FiClock, FiCreditCard } from "react-icons/fi";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-6">
          <span className="text-2xl font-bold text-orange-600">🍽️ E-Canteen</span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Daftar
            </Link>
          </div>
        </nav>

        <div className="py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Pesan Makanan dari Kelas,
            <br />
            <span className="text-orange-600">Ambil Saat Istirahat!</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            E-Canteen menghilangkan antrean panjang di kantin sekolah.
            Pre-order makanan favorit kamu dan ambil tanpa perlu mengantri.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors text-lg"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors text-lg"
            >
              Sudah Punya Akun
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="pb-20 grid sm:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-orange-600" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pilih Menu</h3>
            <p className="mt-2 text-sm text-gray-500">
              Lihat daftar menu kantin dan tambahkan ke keranjang dengan mudah.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiClock className="text-blue-600" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pilih Waktu</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tentukan waktu pengambilan: Istirahat 1 atau Istirahat 2.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiCreditCard className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Bayar dengan Saldo</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gunakan saldo virtual untuk pembayaran yang cepat dan aman.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
