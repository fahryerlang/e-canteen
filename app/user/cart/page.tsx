"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartContext";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiClock } from "react-icons/fi";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [pickupTime, setPickupTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOrder = async () => {
    if (!pickupTime) {
      setError("Pilih waktu pengambilan terlebih dahulu");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupTime,
          items: items.map((item) => ({
            menuId: item.menuId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat pesanan");
        return;
      }

      clearCart();
      router.push("/user/orders");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Keranjang Kosong
        </h2>
        <p className="text-gray-500 mb-6">
          Yuk pilih menu makanan favoritmu!
        </p>
        <Link
          href="/user/menu"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors font-medium"
        >
          <FiArrowLeft />
          Lihat Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/user/menu"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FiArrowLeft />
        Kembali ke Menu
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Kamu</h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Cart Items */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-6">
        {items.map((item) => (
          <div key={item.menuId} className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl">🍽️</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-orange-600 font-medium">
                {formatRupiah(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <FiPlus size={14} />
              </button>
              <button
                onClick={() => removeItem(item.menuId)}
                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pickup Time */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiClock className="text-orange-600" />
          <h2 className="font-semibold text-gray-900">Waktu Pengambilan</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPickupTime("ISTIRAHAT_1")}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              pickupTime === "ISTIRAHAT_1"
                ? "border-orange-600 bg-orange-50 text-orange-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            🕘 Istirahat 1
          </button>
          <button
            onClick={() => setPickupTime("ISTIRAHAT_2")}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              pickupTime === "ISTIRAHAT_2"
                ? "border-orange-600 bg-orange-50 text-orange-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            🕐 Istirahat 2
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Ringkasan Pesanan</h2>
        {items.map((item) => (
          <div
            key={item.menuId}
            className="flex justify-between text-sm py-1.5"
          >
            <span className="text-gray-600">
              {item.name} x{item.quantity}
            </span>
            <span className="text-gray-900 font-medium">
              {formatRupiah(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-orange-600 text-lg">
            {formatRupiah(totalPrice)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full py-4 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? "Memproses Pesanan..." : `Pesan Sekarang - ${formatRupiah(totalPrice)}`}
      </button>
    </div>
  );
}
