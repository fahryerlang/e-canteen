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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
      <div className="min-h-full flex flex-col rounded-[2rem] bg-linear-to-br from-white via-stone-50 to-green-50/70 border border-stone-200 px-6 py-10 sm:px-8 lg:px-10 shadow-sm">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <Link
            href="/user/menu"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm"
          >
            <FiArrowLeft />
            Kembali ke Menu
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-xl text-center bg-white/85 backdrop-blur-sm rounded-[2rem] border border-white shadow-xl shadow-green-900/5 px-8 py-12">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-green-50 text-green-700 flex items-center justify-center">
              <FiShoppingCart size={34} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Keranjang Kosong
            </h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              Belum ada menu yang masuk ke keranjang. Pilih makanan atau minuman dulu supaya bisa langsung checkout.
            </p>
            <Link
              href="/user/menu"
              className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl hover:bg-green-800 transition-colors font-medium"
            >
              <FiArrowLeft />
              Lihat Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col rounded-[2rem] bg-linear-to-br from-white via-stone-50 to-green-50/70 border border-stone-200 p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12 mb-6 lg:mb-8">
        <Link
          href="/user/menu"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-4 transition-colors text-sm"
        >
          <FiArrowLeft />
          Kembali ke Menu
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">Keranjang Kamu</h1>
            <p className="text-stone-500 mt-2 text-sm sm:text-base">
              Review item, atur jumlah, lalu pilih waktu pengambilan sebelum checkout.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-2xl bg-white/80 px-4 py-3 border border-stone-200 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
              <FiShoppingCart size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Total Item</p>
              <p className="text-lg font-bold text-stone-900">{totalItems} item</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-[1.75rem] border border-stone-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 sm:px-6 border-b border-stone-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-stone-900">Daftar Pesanan</h2>
                <p className="text-sm text-stone-500">Atur jumlah item sebelum checkout</p>
              </div>
              <button
                onClick={clearCart}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Kosongkan
              </button>
            </div>
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.menuId} className="p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-green-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdOutlineRestaurant className="text-green-300" size={36} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate text-base">
                      {item.name}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">
                      Harga satuan {formatRupiah(item.price)}
                    </p>
                    <p className="text-base text-green-700 font-semibold mt-2">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-2 py-2">
                      <button
                        onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center border border-stone-200 bg-white rounded-xl text-stone-500 hover:bg-stone-50 transition-colors"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="w-10 text-center font-semibold text-stone-800 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center border border-stone-200 bg-white rounded-xl text-stone-500 hover:bg-stone-50 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.menuId)}
                      className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="min-w-0">
          <div className="xl:sticky xl:top-6 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-[1.75rem] border border-stone-200 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiClock className="text-green-700" />
                <h2 className="font-semibold text-stone-900">Waktu Pengambilan</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <button
                  onClick={() => setPickupTime("ISTIRAHAT_1")}
                  className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                    pickupTime === "ISTIRAHAT_1"
                      ? "border-green-700 bg-green-50 text-green-700 shadow-sm"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiClock size={14} />
                    Istirahat 1
                  </span>
                </button>
                <button
                  onClick={() => setPickupTime("ISTIRAHAT_2")}
                  className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                    pickupTime === "ISTIRAHAT_2"
                      ? "border-green-700 bg-green-50 text-green-700 shadow-sm"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiClock size={14} />
                    Istirahat 2
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-[1.75rem] border border-stone-200 p-5 sm:p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900 mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.menuId}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="text-stone-500 leading-6">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-stone-800 font-medium whitespace-nowrap">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 mt-5 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Jumlah item</span>
                  <span className="font-medium text-stone-800">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">Total</span>
                  <span className="font-bold text-green-700 text-2xl">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full mt-6 py-4 bg-green-700 text-white font-semibold rounded-2xl hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? "Memproses Pesanan..." : `Pesan Sekarang - ${formatRupiah(totalPrice)}`}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
