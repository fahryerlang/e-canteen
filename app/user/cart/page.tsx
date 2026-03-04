"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartContext";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiClock, FiShoppingCart } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";
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
        <FiShoppingCart className="text-stone-300 mx-auto mb-4" size={64} />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">
          Keranjang Kosong
        </h2>
        <p className="text-stone-400 mb-6">
          Yuk pilih menu makanan favoritmu!
        </p>
        <Link
          href="/user/menu"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl hover:bg-green-800 transition-colors font-medium"
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
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6 transition-colors text-sm"
      >
        <FiArrowLeft />
        Kembali ke Menu
      </Link>

      <h1 className="text-2xl font-bold text-stone-900 mb-6">Keranjang Kamu</h1>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Cart Items */}
      <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-100 mb-6">
        {items.map((item) => (
          <div key={item.menuId} className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <MdOutlineRestaurant className="text-green-300" size={32} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-800 truncate text-sm">
                {item.name}
              </h3>
              <p className="text-sm text-green-700 font-medium">
                {formatRupiah(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center font-semibold text-stone-800 text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 transition-colors"
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
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiClock className="text-green-700" />
          <h2 className="font-semibold text-stone-800 text-sm">Waktu Pengambilan</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPickupTime("ISTIRAHAT_1")}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              pickupTime === "ISTIRAHAT_1"
                ? "border-green-700 bg-green-50 text-green-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <FiClock size={14} />
              Istirahat 1
            </span>
          </button>
          <button
            onClick={() => setPickupTime("ISTIRAHAT_2")}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              pickupTime === "ISTIRAHAT_2"
                ? "border-green-700 bg-green-50 text-green-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <FiClock size={14} />
              Istirahat 2
            </span>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
        <h2 className="font-semibold text-stone-800 mb-3 text-sm">Ringkasan Pesanan</h2>
        {items.map((item) => (
          <div
            key={item.menuId}
            className="flex justify-between text-sm py-1.5"
          >
            <span className="text-stone-500">
              {item.name} x{item.quantity}
            </span>
            <span className="text-stone-800 font-medium">
              {formatRupiah(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-stone-100 mt-3 pt-3 flex justify-between">
          <span className="font-semibold text-stone-800">Total</span>
          <span className="font-bold text-green-700 text-lg">
            {formatRupiah(totalPrice)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full py-4 bg-green-700 text-white font-semibold rounded-2xl hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? "Memproses Pesanan..." : `Pesan Sekarang - ${formatRupiah(totalPrice)}`}
      </button>
    </div>
  );
}
