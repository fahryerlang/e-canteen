"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FiClipboard, FiDollarSign, FiHome, FiList, FiLogOut, FiShoppingCart, FiX, FiUsers, FiCreditCard, FiBarChart2, FiMessageSquare, FiHeart, FiUser, FiSend, FiChevronDown, FiTag } from "react-icons/fi";
import { MdOutlineRestaurant, MdStorefront } from "react-icons/md";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  cartCount?: number;
}

export default function AdminSidebar({ isOpen, onToggle, cartCount }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const fetchBadges = useCallback(() => {
    fetch("/api/notifications/badges")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setBadges(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 15000);
    // Listen for badge refresh events from order updates
    const handleBadgeRefresh = () => fetchBadges();
    window.addEventListener("badge-refresh", handleBadgeRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("badge-refresh", handleBadgeRefresh);
    };
  }, [fetchBadges]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    // Auto-expand dropdown if current path is inside it
    if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/buyers") || pathname.startsWith("/admin/sellers")) {
      setOpenMenus((prev) => prev.includes("pengguna") ? prev : [...prev, "pengguna"]);
    }
  }, [pathname]);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const role = user?.role ?? (pathname.startsWith("/admin") ? "ADMIN" : pathname.startsWith("/seller") ? "SELLER" : "USER");

  type NavLink = { href: string; label: string; icon: React.ReactNode; badge?: number; children?: { href: string; label: string }[]; key?: string };

  const adminLinks: NavLink[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/admin/canteens", label: "Kelola Kantin", icon: <MdStorefront /> },
    { href: "/admin/menu", label: "Kelola Menu", icon: <MdOutlineRestaurant /> },
    { href: "/admin/categories", label: "Kelola Kategori", icon: <FiTag /> },
    { href: "/admin/orders", label: "Antrean Pesanan", icon: <FiClipboard />, badge: badges["/admin/orders"] },
    {
      href: "#", label: "Kelola Pengguna", icon: <FiUsers />, key: "pengguna",
      children: [
        { href: "/admin/users", label: "Semua Pengguna" },
        { href: "/admin/sellers", label: "Penjual" },
        { href: "/admin/buyers", label: "Pembeli" },
      ],
    },
    { href: "/admin/topup", label: "Permintaan Top Up", icon: <FiCreditCard />, badge: badges["/admin/topup"] },
    { href: "/admin/withdrawals", label: "Setoran Penjual", icon: <FiSend />, badge: badges["/admin/withdrawals"] },
    { href: "/admin/reports", label: "Laporan", icon: <FiDollarSign /> },
  ];

  const sellerLinks: NavLink[] = [
    { href: "/seller/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/seller/menu", label: "Menu Saya", icon: <FiShoppingCart /> },
    { href: "/seller/orders", label: "Pesanan Masuk", icon: <FiList />, badge: badges["/seller/orders"] },
    { href: "/seller/reports", label: "Laporan", icon: <FiBarChart2 /> },
    { href: "/seller/withdrawals", label: "Setor Saldo", icon: <FiSend /> },
    { href: "/seller/reviews", label: "Ulasan", icon: <FiMessageSquare /> },
  ];

  const userLinks: NavLink[] = [
    { href: "/user/menu", label: "Menu", icon: <FiHome /> },
    { href: "/user/canteens", label: "Kantin", icon: <MdStorefront /> },
    { href: "/user/cart", label: "Keranjang", icon: <FiShoppingCart />, badge: cartCount },
    { href: "/user/orders", label: "Riwayat", icon: <FiList />, badge: badges["/user/orders"] },
    { href: "/user/favorites", label: "Favorit", icon: <FiHeart /> },
    { href: "/user/topup", label: "Top Up", icon: <FiDollarSign /> },
    { href: "/user/profile", label: "Profil", icon: <FiUser /> },
  ];

  const links = role === "ADMIN" ? adminLinks : role === "SELLER" ? sellerLinks : userLinks;
  const homeHref = role === "ADMIN" ? "/admin/dashboard" : role === "SELLER" ? "/seller/dashboard" : "/user/menu";

  return (
    <aside
      className={`w-72 h-screen bg-white border-r border-stone-200 flex flex-col transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="px-6 h-16 border-b border-stone-100 flex items-center justify-between">
        <Link
          href={homeHref}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-green-800"
        >
          <MdOutlineRestaurant size={20} className="shrink-0" />
          E-Canteen
        </Link>
        <button
          onClick={onToggle}
          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Tutup sidebar"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="px-4 py-5 space-y-1">
        {links.map((link) =>
          link.children ? (
            <div key={link.key}>
              <button
                onClick={() => toggleMenu(link.key!)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  link.children.some((c) => pathname.startsWith(c.href))
                    ? "bg-green-50 text-green-700"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  {link.icon}
                  {link.label}
                </span>
                <FiChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${openMenus.includes(link.key!) ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openMenus.includes(link.key!) ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-5 pl-4 border-l border-stone-200 space-y-0.5">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                        pathname.startsWith(child.href)
                          ? "text-green-700 bg-green-50"
                          : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-green-50 text-green-700"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
              }`}
            >
              <span className="relative">
                {link.icon}
                {!!link.badge && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </span>
              <span className="flex-1">{link.label}</span>
              {!!link.badge && link.badge > 0 && (
                <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {link.badge > 99 ? "99+" : link.badge}
                </span>
              )}
            </Link>
          )
        )}
      </div>

      <div className="mt-auto p-4 border-t border-stone-100">
        <div className="px-2 pb-3">
          <p className="text-sm font-medium text-stone-800">{user?.name || "Pengguna"}</p>
          <p className="text-xs text-stone-400 truncate">{user?.email || ""}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <FiLogOut />
          Keluar
        </button>
      </div>
    </aside>
  );
}
