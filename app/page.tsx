"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiShoppingBag,
  FiClock,
  FiCreditCard,
  FiCheckCircle,
  FiStar,
  FiUsers,
  FiPlay,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

const navLinks = [
  { href: "#menu", label: "Menu" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#tentang", label: "Tentang" },
];

const menuItems = [
  {
    name: "Nasi Goreng Spesial",
    price: 15000,
    tag: "Best Seller",
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&q=80",
  },
  {
    name: "Ayam Geprek",
    price: 18000,
    tag: "Favorit",
    img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop&q=80",
  },
  {
    name: "Mie Goreng",
    price: 13000,
    tag: "Populer",
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop&q=80",
  },
  {
    name: "Es Teh Manis",
    price: 5000,
    tag: "Minuman",
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&q=80",
  },
];

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 overflow-x-hidden font-sans">
      {/* ═══ Navbar ═══ */}
      <nav
        className={`fixed inset-x-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "top-4 px-4 sm:px-6"
            : "top-0 px-0"
        }`}
      >
        <div className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "max-w-6xl" : "max-w-full"}`}>
          <div
            className={`relative border transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled
                ? "rounded-[28px] border-white/70 bg-white shadow-xl shadow-stone-900/8 backdrop-blur-xl"
                : "rounded-none border-transparent bg-white/90 shadow-none backdrop-blur-lg"
            }`}
          >
            <div className="relative flex items-center justify-between gap-3 px-3 py-3 sm:px-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-full px-3 py-2 text-stone-900 transition-colors hover:bg-white/70"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-white shadow-sm shadow-green-900/20">
                  <MdOutlineRestaurant size={20} />
                </span>
                <span className="hidden sm:block">
                  <span className="block text-[11px] uppercase tracking-[0.24em] text-stone-400">
                    Smart Canteen
                  </span>
                  <span className="block text-sm font-bold tracking-tight text-green-900">
                    E-Canteen
                  </span>
                </span>
              </Link>

              <div className={`hidden md:flex items-center p-1.5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "rounded-full border border-stone-200/80 bg-stone-100/70 shadow-inner shadow-white/80" : "rounded-full border border-transparent bg-stone-100/50"}`}>
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group relative rounded-full px-4 py-2.5 text-[13px] font-medium text-stone-500 transition-colors duration-200 hover:text-green-900"
                  >
                    <span className="absolute inset-0 rounded-full bg-white opacity-0 scale-95 shadow-sm transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
                    <span className="absolute inset-x-4 bottom-1.5 h-px origin-left scale-x-0 bg-green-700 transition-transform duration-200 group-hover:scale-x-100" />
                    <span className="relative">{item.label}</span>
                  </a>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-[13px] font-medium text-stone-600 hover:text-green-700 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-green-700 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-green-900/20 transition-all duration-200 hover:bg-green-800 hover:-translate-y-0.5"
                >
                  Daftar
                </Link>
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <Link
                  href="/login"
                  className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-[13px] font-medium text-stone-600"
                >
                  Masuk
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-stone-700 shadow-sm"
                  aria-label="Buka menu navigasi"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-3 rounded-4xl border border-white/70 bg-white/92 p-3 shadow-xl shadow-stone-900/8 backdrop-blur-xl md:hidden">
              <div className="space-y-1 rounded-4xl bg-stone-50/80 p-2">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-stone-600 transition-colors hover:bg-white hover:text-green-800"
                  >
                    <span>{item.label}</span>
                    <FiArrowRight size={14} className="text-stone-400" />
                  </a>
                ))}
              </div>
              <Link
                href="/register"
                className="mt-3 flex items-center justify-center rounded-2xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-green-900/20"
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-md mb-5 tracking-wide">
                #1 Kantin Digital Sekolah
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.13] tracking-tight text-stone-900">
                Pesan makanan,
                <br />
                <span className="text-green-700">tanpa antrean.</span>
              </h1>

              <p className="mt-5 text-base text-stone-500 leading-relaxed max-w-md">
                Pilih menu favorit dari kelas, bayar dengan saldo digital, dan
                ambil saat istirahat. Cepat, mudah, tanpa ribet.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-all duration-200"
                >
                  Mulai Pesan
                  <FiArrowRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
                <a
                  href="#cara-kerja"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:border-stone-300 transition-colors"
                >
                  <FiPlay size={13} />
                  Lihat Cara Kerja
                </a>
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex items-center gap-6 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <FiUsers size={13} className="text-green-600" />
                  <strong className="text-stone-600">500+</strong> siswa aktif
                </span>
                <span className="flex items-center gap-1.5">
                  <FiStar
                    size={13}
                    className="text-amber-500 fill-amber-500"
                  />
                  <strong className="text-stone-600">4.9</strong> rating
                </span>
              </div>
            </div>

            {/* Hero image grid */}
            <div className="relative">
              <div className="grid grid-cols-5 grid-rows-4 gap-3 h-80 sm:h-96">
                {/* Main image */}
                <div className="col-span-3 row-span-4 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=700&fit=crop&q=80"
                    alt="Makanan lezat"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Side images */}
                <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop&q=80"
                    alt="Pizza"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop&q=80"
                    alt="Pancake"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Floating order card */}
              <div className="absolute -bottom-5 left-4 bg-white rounded-xl shadow-lg shadow-stone-200/60 px-4 py-3 flex items-center gap-3 border border-stone-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiShoppingBag size={18} className="text-green-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">2,340+</p>
                  <p className="text-[10px] text-stone-400">
                    pesanan bulan ini
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Menu Preview ═══ */}
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-1">
                Menu
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                Menu Populer
              </h2>
            </div>
            <Link
              href="/register"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
            >
              Lihat Semua <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="group bg-stone-50 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300 border border-stone-100"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur text-[10px] font-bold text-stone-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-stone-800 mb-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-green-700">
                      {formatRp(item.price)}
                    </span>
                    <Link
                      href="/register"
                      className="w-8 h-8 flex items-center justify-center bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                    >
                      <FiShoppingBag size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="cara-kerja" className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-2">
              Cara Kerja
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Tiga langkah mudah
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                icon: <FiShoppingBag size={22} />,
                title: "Pilih Menu",
                desc: "Buka daftar menu kantin dan tambahkan makanan ke keranjang.",
              },
              {
                num: "02",
                icon: <FiClock size={22} />,
                title: "Pilih Waktu",
                desc: "Tentukan pengambilan saat Istirahat 1 atau Istirahat 2.",
              },
              {
                num: "03",
                icon: <FiCreditCard size={22} />,
                title: "Bayar & Ambil",
                desc: "Bayar dengan saldo digital, ambil pesanan tanpa mengantri.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                className="group relative bg-white rounded-2xl p-7 border border-stone-100 hover:border-green-200 hover:shadow-md transition-all duration-300"
              >
                <span className="text-4xl font-black text-stone-100 group-hover:text-green-600 absolute top-5 right-6 select-none transition-all duration-300 ease-out opacity-70 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 scale-95 group-hover:scale-100">
                  {item.num}
                </span>
                <div className="w-11 h-11 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-stone-800 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-px bg-stone-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ About / Features ═══ */}
      <section id="tentang" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left image */}
            <div className="rounded-2xl overflow-hidden h-72 sm:h-96">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=500&fit=crop&q=80"
                alt="Siswa memesan makanan"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right text */}
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-2">
                Kenapa E-Canteen?
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-6">
                Dirancang untuk
                <br />
                kemudahan siswa
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: <FiClock size={18} />,
                    title: "Hemat Waktu",
                    desc: "Pesan dari kelas, tidak perlu antrean di kantin.",
                  },
                  {
                    icon: <FiCreditCard size={18} />,
                    title: "Saldo Digital",
                    desc: "Bayar tanpa uang tunai, aman dan transparan.",
                  },
                  {
                    icon: <FiCheckCircle size={18} />,
                    title: "Status Real-time",
                    desc: "Pantau pesanan dari diproses hingga siap diambil.",
                  },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 shrink-0 bg-green-50 text-green-700 rounded-xl flex items-center justify-center">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-800 mb-0.5">
                        {f.title}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="bg-green-800 rounded-2xl px-8 py-12 sm:px-14 sm:py-16 text-center relative overflow-hidden">
            {/* Subtle decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Siap pesan tanpa antrean?
              </h2>
              <p className="text-green-200 text-sm max-w-md mx-auto mb-8">
                Daftar sekarang dan mulai nikmati kemudahan memesan makanan
                dari kantin sekolah.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-green-800 text-sm font-bold rounded-lg hover:bg-green-50 transition-colors"
                >
                  Daftar Gratis
                  <FiArrowRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-3 text-sm font-medium text-white rounded-lg border border-white/25 hover:bg-white/10 transition-colors"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-stone-900 text-stone-300 pt-14 pb-6">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {/* Top grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-stone-800">
            {/* Brand */}
            <div className="lg:col-span-1">
              <span className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                <MdOutlineRestaurant size={20} className="text-green-500" />
                E-Canteen
              </span>
              <p className="text-sm leading-relaxed text-stone-400">
                Platform kantin digital untuk siswa. Pesan makanan dari kelas, bayar dengan saldo, ambil tanpa antrean.
              </p>
              <div className="flex gap-3 mt-5">
                {[
                  { icon: <FiInstagram size={16} />, href: "#" },
                  { icon: <FiTwitter size={16} />, href: "#" },
                  { icon: <FiYoutube size={16} />, href: "#" },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-800 text-stone-400 hover:bg-green-700 hover:text-white transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
                Menu
              </h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Beranda", href: "/" },
                  { label: "Daftar Menu", href: "/register" },
                  { label: "Cara Kerja", href: "#cara-kerja" },
                  { label: "Tentang Kami", href: "#tentang" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-stone-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Layanan */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
                Layanan
              </h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Pesan Makanan",
                  "Saldo Digital",
                  "Riwayat Pesanan",
                  "Top Up Saldo",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="/register"
                      className="text-stone-400 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
                Kontak
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <FiMapPin size={15} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-stone-400">
                    Jl. Pendidikan No. 1, Jakarta
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FiPhone size={15} className="text-green-500 shrink-0" />
                  <span className="text-stone-400">(021) 1234-5678</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FiMail size={15} className="text-green-500 shrink-0" />
                  <span className="text-stone-400">info@e-canteen.sch.id</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} E-Canteen. Kantin Digital Sekolah.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-stone-300 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="hover:text-stone-300 transition-colors">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
