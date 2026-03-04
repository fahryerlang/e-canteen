"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiClipboard, FiDollarSign, FiHome, FiList, FiLogOut, FiShoppingCart, FiX, FiUsers, FiCreditCard, FiBarChart2, FiMessageSquare, FiHeart, FiUser } from "react-icons/fi";
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
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const role = user?.role ?? (pathname.startsWith("/admin") ? "ADMIN" : pathname.startsWith("/seller") ? "SELLER" : "USER");

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/admin/canteens", label: "Kelola Kantin", icon: <MdStorefront /> },
    { href: "/admin/menu", label: "Kelola Menu", icon: <MdOutlineRestaurant /> },
    { href: "/admin/orders", label: "Antrean Pesanan", icon: <FiClipboard /> },
    { href: "/admin/users", label: "Kelola Pengguna", icon: <FiUsers /> },
    { href: "/admin/topup", label: "Permintaan Top Up", icon: <FiCreditCard /> },
    { href: "/admin/reports", label: "Laporan", icon: <FiDollarSign /> },
  ];

  const sellerLinks = [
    { href: "/seller/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/seller/menu", label: "Menu Saya", icon: <FiShoppingCart /> },
    { href: "/seller/orders", label: "Pesanan Masuk", icon: <FiList /> },
    { href: "/seller/reports", label: "Laporan", icon: <FiBarChart2 /> },
    { href: "/seller/reviews", label: "Ulasan", icon: <FiMessageSquare /> },
  ];

  const userLinks = [
    { href: "/user/menu", label: "Menu", icon: <FiHome /> },
    { href: "/user/orders", label: "Pesanan Saya", icon: <FiList /> },
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

      <div className="px-4 py-5 space-y-1.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? "bg-green-50 text-green-700"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
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
