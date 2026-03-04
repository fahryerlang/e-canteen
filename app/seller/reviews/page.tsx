"use client";

import { useEffect, useState } from "react";
import { FiStar, FiMessageSquare, FiUser } from "react-icons/fi";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string };
  menu: { id: number; name: string; category: string; image: string | null };
}

interface Stats {
  totalReviews: number;
  avgRating: number;
  ratingDistribution: number[];
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0); // 0 = all

  useEffect(() => {
    fetch("/api/seller/reviews")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setReviews(data.reviews);
          setStats(data.stats);
        }
        setLoading(false);
      });
  }, []);

  const filtered = filterRating > 0 ? reviews.filter((r) => r.rating === filterRating) : reviews;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-stone-50 in-[.sidebar-closed]:pl-12">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Ulasan Pelanggan</h1>

      {loading ? (
        <div className="text-center py-20 text-stone-400">Memuat ulasan...</div>
      ) : (
        <>
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Average Rating */}
              <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center">
                <p className="text-5xl font-bold text-amber-500">{stats.avgRating}</p>
                <div className="text-amber-400 text-lg mt-1">{stars(Math.round(stats.avgRating))}</div>
                <p className="text-xs text-stone-400 mt-2">{stats.totalReviews} ulasan</p>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">Distribusi Rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = stats.ratingDistribution[n - 1];
                    const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center gap-3">
                        <button
                          onClick={() => setFilterRating(filterRating === n ? 0 : n)}
                          className={`flex items-center gap-1 text-xs font-medium w-12 ${filterRating === n ? "text-amber-600" : "text-stone-500"}`}
                        >
                          {n} <FiStar size={11} />
                        </button>
                        <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-500 w-10 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setFilterRating(0)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterRating === 0 ? "bg-green-600 text-white" : "bg-white text-stone-500 border border-stone-200"
              }`}
            >
              Semua ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                onClick={() => setFilterRating(filterRating === n ? 0 : n)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterRating === n ? "bg-amber-500 text-white" : "bg-white text-stone-500 border border-stone-200"
                }`}
              >
                {n}★ ({reviews.filter((r) => r.rating === n).length})
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FiMessageSquare size={40} className="mx-auto text-stone-300 mb-3" />
              <p className="text-stone-400">Belum ada ulasan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                  <div className="flex items-start gap-4">
                    {/* Menu Image */}
                    <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                      {r.menu.image ? (
                        <img src={r.menu.image} alt={r.menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-lg">🍽️</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-stone-800">{r.menu.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-amber-400 text-sm">{stars(r.rating)}</span>
                            <span className="text-xs text-stone-400">{formatDate(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {r.comment && (
                        <p className="text-sm text-stone-600 mt-2 leading-relaxed">{r.comment}</p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
                        <FiUser size={12} />
                        {r.user.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
