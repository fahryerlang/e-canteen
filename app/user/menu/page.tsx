"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/components/CartContext";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiMinus, FiShoppingCart, FiCheck } from "react-icons/fi";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
}

export default function UserMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, totalItems, totalPrice } = useCart();

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCartQuantity = (menuId: number) => {
    const item = items.find((i) => i.menuId === menuId);
    return item?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Kantin</h1>
          <p className="text-gray-500 mt-1">Pilih makanan favoritmu</p>
        </div>
        {totalItems > 0 && (
          <Link
            href="/user/cart"
            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-xl hover:bg-orange-700 transition-colors font-medium"
          >
            <FiShoppingCart size={18} />
            Keranjang ({totalItems}) - {formatRupiah(totalPrice)}
          </Link>
        )}
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">Belum ada menu tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => {
            const qty = getCartQuantity(menu.id);
            return (
              <div
                key={menu.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  !menu.available
                    ? "opacity-60 border-gray-200"
                    : "border-gray-100 hover:shadow-md"
                }`}
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🍽️</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {menu.name}
                    </h3>
                    {!menu.available && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                        Habis
                      </span>
                    )}
                  </div>
                  <p className="text-orange-600 font-bold text-lg mb-4">
                    {formatRupiah(menu.price)}
                  </p>

                  {menu.available && (
                    <div>
                      {qty === 0 ? (
                        <button
                          onClick={() =>
                            addItem({
                              menuId: menu.id,
                              name: menu.name,
                              price: menu.price,
                              image: menu.image,
                            })
                          }
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
                        >
                          <FiPlus size={16} />
                          Tambah ke Keranjang
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2">
                          <button
                            onClick={() =>
                              updateQuantity(menu.id, qty - 1)
                            }
                            className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="font-semibold text-orange-700 flex items-center gap-1">
                            <FiCheck size={14} />
                            {qty} porsi
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(menu.id, qty + 1)
                            }
                            className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart button for mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:hidden">
          <Link
            href="/user/cart"
            className="flex items-center justify-center gap-2 bg-orange-600 text-white py-4 rounded-2xl shadow-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
          >
            <FiShoppingCart size={20} />
            Lihat Keranjang ({totalItems}) - {formatRupiah(totalPrice)}
          </Link>
        </div>
      )}
    </div>
  );
}
