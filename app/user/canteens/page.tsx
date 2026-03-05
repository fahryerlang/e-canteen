"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { MdStorefront, MdOutlineRestaurant } from "react-icons/md";
import { FiPackage, FiChevronRight, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";

const CircularGallery = dynamic(
  () => import("@/components/CircularGallery"),
  { ssr: false }
);

interface MenuData {
  id: number;
  name: string;
  price: number;
  available: boolean;
  image: string | null;
}

interface CanteenData {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  menus: MenuData[];
  _count: { menus: number; users: number };
}

export default function UserCanteensPage() {
  const [canteens, setCanteens] = useState<CanteenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGalleries, setOpenGalleries] = useState<Set<number>>(new Set());
  const [selectedCanteen, setSelectedCanteen] = useState<CanteenData | null>(null);

  const toggleGallery = useCallback((id: number) => {
    setOpenGalleries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    fetch("/api/canteens")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCanteens(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const proxyImage = (url: string) => {
    if (!url) return `https://picsum.photos/seed/fallback/800/600`;
    if (url.startsWith("data:")) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  const getGalleryItems = (menus: MenuData[]) => {
    const available = menus.filter((m) => m.available);
    if (available.length === 0) return [];
    return available.map((m) => ({
      image: proxyImage(m.image || ""),
      text: `${m.name} — ${formatRupiah(m.price)}`,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-stone-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <MdStorefront className="text-green-600" />
          Daftar Kantin
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Jelajahi kantin yang tersedia dan lihat menu mereka
        </p>
      </div>

      {/* Canteen Grid */}
      {canteens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <MdStorefront size={48} className="mb-3 opacity-40" />
          <p className="text-lg font-medium">Belum ada kantin</p>
          <p className="text-sm">Kantin belum terdaftar di sistem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {canteens.map((canteen) => {
            const availableMenus = canteen.menus.filter((m) => m.available);
            const isOpen = openGalleries.has(canteen.id);
            const galleryItems = getGalleryItems(canteen.menus);

            return (
              <div
                key={canteen.id}
                className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-green-900/5 hover:border-green-200"
              >
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                          isOpen
                            ? "bg-green-600 text-white"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        <MdOutlineRestaurant size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800 text-lg">
                          {canteen.name}
                        </h3>
                        {canteen.description && (
                          <p className="text-sm text-stone-400 mt-0.5 line-clamp-1">
                            {canteen.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        canteen.isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      {canteen.isActive ? "Buka" : "Tutup"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-stone-500">
                      <FiPackage size={14} className="text-stone-400" />
                      <span>
                        <strong className="text-stone-700">{canteen._count.menus}</strong>{" "}
                        menu
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-stone-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>
                        <strong className="text-stone-700">{availableMenus.length}</strong>{" "}
                        tersedia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gallery / Preview Area */}
                <div className="relative h-56 border-t border-stone-100 overflow-hidden">
                  {/* Static preview (thumbnails) */}
                  <div
                    onClick={() => galleryItems.length > 0 && !isOpen && toggleGallery(canteen.id)}
                    className={`absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center cursor-pointer transition-all duration-500 ease-in-out ${
                      isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                    }`}
                  >
                    {availableMenus.length > 0 ? (
                      <div className="text-center px-6">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          {availableMenus.slice(0, 4).map((menu) => (
                            <div
                              key={menu.id}
                              className="w-14 h-14 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
                            >
                              {menu.image ? (
                                <img
                                  src={menu.image}
                                  alt={menu.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <MdOutlineRestaurant
                                  size={20}
                                  className="text-stone-300"
                                />
                              )}
                            </div>
                          ))}
                          {availableMenus.length > 4 && (
                            <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-sm font-semibold text-green-600">
                              +{availableMenus.length - 4}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 flex items-center justify-center gap-1">
                          <FiEye size={12} />
                          Klik untuk menjelajahi menu
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <MdOutlineRestaurant
                          size={32}
                          className="mx-auto text-stone-300 mb-2"
                        />
                        <p className="text-sm text-stone-400">
                          Belum ada menu tersedia
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Gallery overlay (always mounted when items exist, animated in/out) */}
                  {galleryItems.length > 0 && (
                    <div
                      className={`absolute inset-0 z-10 bg-gradient-to-br from-green-900 to-green-950 transition-all duration-500 ease-in-out ${
                        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                      }`}
                    >
                      {isOpen && (
                        <CircularGallery
                          items={galleryItems}
                          bend={0}
                          textColor="#ffffff"
                          borderRadius={0.02}
                          scrollSpeed={2.9}
                          scrollEase={0.1}
                        />
                      )}
                      {/* Close hint */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleGallery(canteen.id); }}
                        className="absolute top-2 right-2 z-20 px-2.5 py-1 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-lg text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-all duration-200"
                      >
                        <FiEyeOff size={12} />
                        Tutup
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="p-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {availableMenus.slice(0, 3).map((menu) => (
                      <span
                        key={menu.id}
                        className="px-2 py-0.5 bg-stone-50 text-stone-500 text-xs rounded-md"
                      >
                        {menu.name}
                      </span>
                    ))}
                    {availableMenus.length > 3 && (
                      <span className="px-2 py-0.5 bg-stone-50 text-stone-400 text-xs rounded-md">
                        +{availableMenus.length - 3} lainnya
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCanteen(canteen)}
                    className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                  >
                    Detail
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCanteen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setSelectedCanteen(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <MdOutlineRestaurant size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">
                    {selectedCanteen.name}
                  </h2>
                  {selectedCanteen.description && (
                    <p className="text-sm text-stone-400">
                      {selectedCanteen.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCanteen(null)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-600"
              >
                <FiX size={18} />
              </button>
            </div>



            {/* Menu List */}
            <div className="p-5 overflow-y-auto flex-1 min-h-0">
              <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wider mb-3">
                Daftar Menu
              </h3>
              {selectedCanteen.menus.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">
                  Belum ada menu
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCanteen.menus.map((menu) => (
                    <div
                      key={menu.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        menu.available
                          ? "bg-stone-50 hover:bg-green-50"
                          : "bg-stone-50/50 opacity-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                        {menu.image ? (
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <MdOutlineRestaurant
                            size={16}
                            className="text-stone-300"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 truncate">
                          {menu.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatRupiah(menu.price)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          menu.available
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        {menu.available ? "Tersedia" : "Habis"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 flex justify-end shrink-0">
              <Link
                href="/user/menu"
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
              >
                Pesan dari Menu
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
