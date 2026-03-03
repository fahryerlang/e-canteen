"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiLogOut, FiHome, FiShoppingCart, FiList, FiDollarSign } from "react-icons/fi";
import { formatRupiah } from "@/lib/utils";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  balance: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const userLinks = [
    { href: "/user/menu", label: "Menu", icon: <FiHome /> },
    { href: "/user/orders", label: "Pesanan Saya", icon: <FiList /> },
    { href: "/user/topup", label: "Top Up", icon: <FiDollarSign /> },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
    { href: "/admin/menu", label: "Kelola Menu", icon: <FiShoppingCart /> },
    { href: "/admin/orders", label: "Antrean Pesanan", icon: <FiList /> },
    { href: "/admin/reports", label: "Laporan", icon: <FiDollarSign /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href={isAdmin ? "/admin/dashboard" : "/user/menu"}
            className="text-xl font-bold text-orange-600"
          >
            🍽️ E-Canteen
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* User info & logout (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              {!isAdmin && (
                <p className="text-xs text-gray-500">
                  Saldo: {formatRupiah(user.balance)}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut />
              Keluar
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            {!isAdmin && (
              <p className="text-xs text-gray-500">
                Saldo: {formatRupiah(user.balance)}
              </p>
            )}
          </div>
          <div className="py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? "bg-orange-50 text-orange-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 w-full"
            >
              <FiLogOut />
              Keluar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
