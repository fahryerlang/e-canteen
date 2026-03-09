"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/app/components/CartContext";
import { formatRupiah } from "@/lib/utils";
import { FiPlus, FiMinus, FiShoppingCart, FiCheck, FiSearch, FiX, FiHeart } from "react-icons/fi";
import { MdOutlineRestaurant, MdFastfood, MdLocalCafe, MdBakeryDining } from "react-icons/md";
import { FiStar } from "react-icons/fi";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  category: string;
  description: string | null;
  avgRating: number;
  totalReviews: number;
  canteen: { id: number; name: string } | null;
}

const CATEGORIES = [
  { value: "ALL", label: "Semua", icon: MdOutlineRestaurant },
  { value: "MAKANAN", label: "Makanan", icon: MdFastfood },
  { value: "MINUMAN", label: "Minuman", icon: MdLocalCafe },
  { value: "SNACK", label: "Snack", icon: MdBakeryDining },
];

export default function UserMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokenImageIds, setBrokenImageIds] = useState<number[]>([]);
  const [activeCanteen, setActiveCanteen] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const { items, addItem, updateQuantity, totalItems, totalPrice } = useCart();

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenus(data);
        setBrokenImageIds([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/user/favorites")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setFavoriteIds(new Set(data.map((f: { menuId: number }) => f.menuId)));
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = async (menuId: number) => {
    const res = await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(menuId); else next.delete(menuId);
        return next;
      });
    }
  };

  const getCartQuantity = (menuId: number) => {
    const item = items.find((i) => i.menuId === menuId);
    return item?.quantity || 0;
  };

  const filtered = useMemo(() => {
    let result = menus;
    if (activeCanteen) result = result.filter((m) => m.canteen?.id === activeCanteen);
    if (activeCategory !== "ALL") result = result.filter((m) => m.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q) || m.canteen?.name.toLowerCase().includes(q));
    }
    return result;
  }, [menus, activeCanteen, activeCategory, searchQuery]);

  const canteens = useMemo(() => {
    return Array.from(
      new Map(menus.filter((m) => m.canteen).map((m) => [m.canteen!.id, m.canteen!])).values()
    );
  }, [menus]);

  // Group by canteen
  const groups = useMemo(() => {
    const g: { canteenName: string; items: MenuItem[] }[] = [];
    const seen = new Map<string, MenuItem[]>();
    for (const m of filtered) {
      const key = m.canteen?.name ?? "Tanpa Kantin";
      if (!seen.has(key)) { seen.set(key, []); g.push({ canteenName: key, items: seen.get(key)! }); }
      seen.get(key)!.push(m);
    }
    return g;
  }, [filtered]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Menu Kantin</h1>
          <p className="text-stone-400 mt-1 text-sm">Pilih makanan favoritmu</p>
        </div>
        {totalItems > 0 && (
          <Link
            href="/user/cart"
            className="flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-xl hover:bg-green-800 transition-colors font-medium text-sm"
          >
            <FiShoppingCart size={18} />
            Keranjang ({totalItems}) - {formatRupiah(totalPrice)}
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
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

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.value ? "bg-green-700 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Canteen filter tabs */}
      {canteens.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCanteen(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCanteen === null ? "bg-stone-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
          >
            Semua Kantin
          </button>
          {canteens.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCanteen(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCanteen === c.id ? "bg-stone-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Active filter indicator */}
      {(searchQuery || activeCategory !== "ALL") && (
        <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5 mb-6">
          <span className="text-xs text-stone-500">
            Menampilkan <span className="font-semibold text-stone-700">{filtered.length}</span> menu
            {searchQuery && <> untuk &ldquo;<span className="font-semibold text-stone-700">{searchQuery}</span>&rdquo;</>}
            {activeCategory !== "ALL" && <> di kategori <span className="font-semibold text-stone-700">{CATEGORIES.find((c) => c.value === activeCategory)?.label}</span></>}
          </span>
          <button onClick={() => { setSearchQuery(""); setActiveCategory("ALL"); }} className="text-xs text-green-700 font-medium hover:underline">
            Reset Filter
          </button>
        </div>
      )}

      {!loading && filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <MdOutlineRestaurant size={48} className="mx-auto mb-3 text-stone-300" />
          <p className="text-lg font-medium text-stone-500">{searchQuery ? "Menu tidak ditemukan" : "Belum ada menu tersedia"}</p>
          <p className="text-sm mt-1">{searchQuery ? "Coba kata kunci lain" : "Menu akan muncul saat seller menambahkan produk"}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ canteenName, items: groupMenus }) => (
            <div key={canteenName}>
              {groups.length > 1 && (
                <h2 className="text-base font-semibold text-stone-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  {canteenName}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupMenus.map((menu) => {
                  const qty = getCartQuantity(menu.id);
                  return (
                    <div
                      key={menu.id}
                      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                        !menu.available
                          ? "opacity-60 border-stone-200"
                          : "border-stone-100 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="h-48 bg-linear-to-br from-green-50 to-stone-100 flex items-center justify-center relative">
                        {menu.image && !brokenImageIds.includes(menu.id) ? (
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setBrokenImageIds((prev) =>
                                prev.includes(menu.id) ? prev : [...prev, menu.id]
                              )
                            }
                          />
                        ) : (
                          <MdOutlineRestaurant className="text-green-200" size={64} />
                        )}
                        {/* Category badge */}
                        <span className="absolute top-3 left-3 text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-stone-600 px-2 py-1 rounded-full">
                          {CATEGORIES.find((c) => c.value === menu.category)?.label ?? menu.category}
                        </span>
                        {/* Favorite button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(menu.id); }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                            favoriteIds.has(menu.id) ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-stone-400 hover:text-red-500"
                          }`}
                        >
                          <FiHeart size={14} className={favoriteIds.has(menu.id) ? "fill-current" : ""} />
                        </button>
                        {/* Rating badge */}
                        {menu.totalReviews > 0 && (
                          <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-amber-600 px-2 py-1 rounded-full">
                            <FiStar size={11} className="fill-amber-400 text-amber-400" />
                            {menu.avgRating}
                            <span className="text-stone-400 font-normal">({menu.totalReviews})</span>
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-bold text-stone-800">{menu.name}</h3>
                          {!menu.available && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">Habis</span>
                          )}
                        </div>
                        {menu.description && (
                          <p className="text-xs text-stone-400 mb-2 line-clamp-2">{menu.description}</p>
                        )}
                        <p className="text-green-700 font-extrabold text-sm mb-4">{formatRupiah(menu.price)}</p>
                        {menu.available && (
                          <div>
                            {qty === 0 ? (
                              <button
                                onClick={() => addItem({ menuId: menu.id, name: menu.name, price: menu.price, image: menu.image })}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors font-medium text-sm"
                              >
                                <FiPlus size={16} />
                                Tambah ke Keranjang
                              </button>
                            ) : (
                              <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                                <button onClick={() => updateQuantity(menu.id, qty - 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-green-200 text-green-700 hover:bg-green-100 transition-colors">
                                  <FiMinus size={14} />
                                </button>
                                <span className="font-semibold text-green-700 flex items-center gap-1 text-sm">
                                  <FiCheck size={14} />{qty} porsi
                                </span>
                                <button onClick={() => updateQuantity(menu.id, qty + 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-green-200 text-green-700 hover:bg-green-100 transition-colors">
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
            </div>
          ))}
        </div>
      )}

      {/* Floating cart button for mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:hidden">
          <Link
            href="/user/cart"
            className="flex items-center justify-center gap-2 bg-green-700 text-white py-4 rounded-2xl shadow-lg hover:bg-green-800 transition-colors font-semibold text-lg"
          >
            <FiShoppingCart size={20} />
            Lihat Keranjang ({totalItems}) - {formatRupiah(totalPrice)}
          </Link>
        </div>
      )}
    </div>
  );
}
