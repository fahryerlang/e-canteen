"use client";

import { useEffect, useState } from "react";
import { FiHeart, FiStar, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/app/components/CartContext";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
  description: string | null;
  available: boolean;
  canteen: { id: number; name: string } | null;
  avgRating: number;
  totalReviews: number;
}

interface Favorite {
  id: number;
  menuId: number;
  createdAt: string;
  menu: MenuItem;
}

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/user/favorites")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setFavorites(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const removeFavorite = async (menuId: number) => {
    const res = await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId }),
    });
    if (res.ok) {
      setFavorites((prev) => prev.filter((f) => f.menuId !== menuId));
    }
  };

  const addToCart = (menu: MenuItem) => {
    if (!menu.available) return;
    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      image: menu.image,
    });
  };

  const formatRp = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const categoryLabel = (c: string) => (c === "MAKANAN" ? "Makanan" : c === "MINUMAN" ? "Minuman" : "Snack");
  const categoryBadge = (c: string) =>
    c === "MAKANAN" ? "bg-orange-100 text-orange-700" : c === "MINUMAN" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700";

  return (
    <div className="space-y-6">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <h1 className="text-2xl font-bold text-stone-900">Menu Favorit</h1>
        <p className="text-stone-400 mt-1 text-sm">Menu favorit Anda untuk pemesanan cepat</p>
      </div>

      {!loading && favorites.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 font-medium">Belum ada menu favorit</p>
          <p className="text-sm text-stone-400 mt-1">Tambahkan menu favorit dari halaman Menu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((f) => {
            const m = f.menu;
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden group">
                {/* Image */}
                <div className="relative h-40 bg-stone-100">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">🍽️</div>
                  )}
                  {!m.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-red-500 px-3 py-1 rounded-full">Habis</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFavorite(m.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    title="Hapus dari favorit"
                  >
                    <FiTrash2 size={14} />
                  </button>
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium ${categoryBadge(m.category)}`}>
                    {categoryLabel(m.category)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-stone-800 text-sm leading-tight">{m.name}</h3>
                    {m.avgRating > 0 && (
                      <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                        <FiStar size={12} fill="currentColor" />
                        <span className="text-xs font-medium">{m.avgRating}</span>
                      </div>
                    )}
                  </div>
                  {m.canteen && <p className="text-[11px] text-stone-400 mb-2">{m.canteen.name}</p>}
                  {m.description && <p className="text-xs text-stone-400 line-clamp-2 mb-3">{m.description}</p>}

                  <div className="flex items-center justify-between">
                    <p className="text-green-700 font-bold text-sm">{formatRp(m.price)}</p>
                    <button
                      onClick={() => addToCart(m)}
                      disabled={!m.available}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40"
                    >
                      <FiShoppingCart size={13} />
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
