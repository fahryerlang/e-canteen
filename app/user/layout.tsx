"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import { CartProvider } from "@/app/components/CartContext";
import { FiMenu } from "react-icons/fi";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <CartProvider>
      <div className="h-screen bg-stone-50 flex overflow-hidden">
        <div
          className={`h-screen overflow-hidden transition-[width] duration-300 ${
            isSidebarOpen ? "w-72" : "w-0"
          }`}
        >
          <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen((prev) => !prev)} />
        </div>
        <main className={`relative flex-1 min-w-0 h-screen overflow-y-auto bg-stone-50 px-5 sm:px-8 py-8 transition-all duration-300 ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-8 left-5 sm:left-8 z-30 inline-flex items-center justify-center w-10 h-10 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-800 hover:bg-stone-50 transition-colors"
              aria-label="Buka sidebar"
            >
              <FiMenu size={18} />
            </button>
          )}
          <div className="w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
