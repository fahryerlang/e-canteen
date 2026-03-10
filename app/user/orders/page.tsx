"use client";

import { useState, useEffect } from "react";
import { FiClipboard, FiClock, FiCheckCircle, FiAlertCircle, FiPackage, FiRefreshCw, FiStar, FiSend } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";
import { formatRupiah, formatDate, pickupTimeLabel, orderStatusLabel, orderStatusColor } from "@/lib/utils";

interface OrderItem {
  id: number;
  menuId: number;
  quantity: number;
  unitPrice: number;
  menu: { name: string; image: string | null };
}

interface Order {
  id: number;
  pickupTime: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface Review {
  id: number;
  menuId: number;
  orderId: number;
  rating: number;
  comment: string | null;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewingOrder, setReviewingOrder] = useState<number | null>(null);
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  const fetchReviews = () => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => setMyReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    fetchReviews();
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "DIPROSES": return <FiClock size={14} />;
      case "SIAP_DIAMBIL": return <FiAlertCircle size={14} />;
      case "SELESAI": return <FiCheckCircle size={14} />;
      default: return null;
    }
  };

  const statusAccent = (status: string) => {
    switch (status) {
      case "DIPROSES": return "border-l-amber-400";
      case "SIAP_DIAMBIL": return "border-l-blue-400";
      case "SELESAI": return "border-l-green-400";
      default: return "border-l-stone-300";
    }
  };

  const countByStatus = {
    DIPROSES: orders.filter((o) => o.status === "DIPROSES").length,
    SIAP_DIAMBIL: orders.filter((o) => o.status === "SIAP_DIAMBIL").length,
    SELESAI: orders.filter((o) => o.status === "SELESAI").length,
  };

  const filteredOrders = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const getReview = (orderId: number, menuId: number) => {
    return myReviews.find((r) => r.orderId === orderId && r.menuId === menuId);
  };

  const reviewKey = (orderId: number, menuId: number) => `${orderId}-${menuId}`;

  const handleSubmitReviews = async (order: Order) => {
    setSubmittingReview(true);
    for (const item of order.items) {
      const key = reviewKey(order.id, item.menuId);
      const rating = reviewRatings[key];
      if (rating && rating > 0) {
        await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menuId: item.menuId,
            orderId: order.id,
            rating,
            comment: reviewComments[key] || null,
          }),
        });
      }
    }
    setSubmittingReview(false);
    setReviewingOrder(null);
    fetchReviews();
  };

  const allItemsReviewed = (order: Order) => {
    return order.items.every((item) => getReview(order.id, item.menuId));
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`transition-colors ${star <= value ? "text-amber-400" : "text-stone-300 hover:text-amber-300"}`}
        >
          <FiStar size={18} className={star <= value ? "fill-amber-400" : ""} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
          <h1 className="text-2xl font-bold text-stone-900">Pesanan Saya</h1>
          <p className="text-stone-400 mt-1 text-sm">
            {countByStatus.DIPROSES + countByStatus.SIAP_DIAMBIL > 0
              ? `${countByStatus.DIPROSES + countByStatus.SIAP_DIAMBIL} pesanan aktif`
              : "Pantau status pesanan kamu di sini"}
          </p>
        </div>
        {/* Refresh button removed for realtime UX */}
      </div>

      {/* Status Summary */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setFilter(filter === "DIPROSES" ? "ALL" : "DIPROSES")} className={`text-left rounded-xl px-4 py-3 border transition-all ${filter === "DIPROSES" ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-white border-stone-100 hover:border-amber-200"}`}>
            <div className="flex items-center gap-1.5 text-amber-600 mb-1"><FiClock size={13} /><span className="text-[11px] font-medium">Disiapkan</span></div>
            <p className="text-xl font-bold text-amber-700">{countByStatus.DIPROSES}</p>
          </button>
          <button onClick={() => setFilter(filter === "SIAP_DIAMBIL" ? "ALL" : "SIAP_DIAMBIL")} className={`text-left rounded-xl px-4 py-3 border transition-all ${filter === "SIAP_DIAMBIL" ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-stone-100 hover:border-blue-200"}`}>
            <div className="flex items-center gap-1.5 text-blue-600 mb-1"><FiAlertCircle size={13} /><span className="text-[11px] font-medium">Siap Diambil</span></div>
            <p className="text-xl font-bold text-blue-700">{countByStatus.SIAP_DIAMBIL}</p>
          </button>
          <button onClick={() => setFilter(filter === "SELESAI" ? "ALL" : "SELESAI")} className={`text-left rounded-xl px-4 py-3 border transition-all ${filter === "SELESAI" ? "bg-green-50 border-green-200 shadow-sm" : "bg-white border-stone-100 hover:border-green-200"}`}>
            <div className="flex items-center gap-1.5 text-green-600 mb-1"><FiCheckCircle size={13} /><span className="text-[11px] font-medium">Selesai</span></div>
            <p className="text-xl font-bold text-green-700">{countByStatus.SELESAI}</p>
          </button>
        </div>
      )}

      {/* Filter indicator */}
      {filter !== "ALL" && (
        <div className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2.5">
          <span className="text-xs text-stone-500">Menampilkan: <span className="font-semibold text-stone-700">{orderStatusLabel(filter)}</span> ({filteredOrders.length})</span>
          <button onClick={() => setFilter("ALL")} className="text-xs text-green-700 font-medium hover:underline">Tampilkan Semua</button>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPackage className="text-stone-300" size={32} />
          </div>
          <p className="text-lg font-medium text-stone-600">{filter !== "ALL" ? "Tidak ada pesanan dengan status ini" : "Belum ada pesanan"}</p>
          <p className="text-sm text-stone-400 mt-1">{filter !== "ALL" ? "Coba lihat status lainnya" : "Pesanan kamu akan muncul di sini"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-2xl border border-stone-100 border-l-4 ${statusAccent(order.status)} overflow-hidden transition-all hover:shadow-sm ${order.status === "SELESAI" ? "opacity-80" : ""}`}>
              {/* Order Header */}
              <div className="px-5 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      order.status === "DIPROSES" ? "bg-amber-100 text-amber-600" :
                      order.status === "SIAP_DIAMBIL" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    }`}>{statusIcon(order.status)}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-stone-800 text-sm">Pesanan #{order.id}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${orderStatusColor(order.status)}`}>{statusIcon(order.status)}{orderStatusLabel(order.status)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-stone-400"><FiClock size={11} />{formatDate(order.createdAt)}</span>
                        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">{pickupTimeLabel(order.pickupTime)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-700 shrink-0">{formatRupiah(order.totalPrice)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-5 pb-4">
                <div className="bg-stone-50/80 rounded-xl p-3 space-y-2">
                  {order.items.map((item) => {
                    const review = getReview(order.id, item.menuId);
                    return (
                      <div key={item.id}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-white border border-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                              {item.menu.image ? (
                                <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                              ) : (
                                <MdOutlineRestaurant className="text-stone-300" size={14} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-stone-700 truncate">{item.menu.name}</p>
                              <p className="text-[11px] text-stone-400">{item.quantity}x @ {formatRupiah(item.unitPrice)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {review && (
                              <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                                <FiStar size={11} className="fill-amber-400 text-amber-400" />{review.rating}
                              </span>
                            )}
                            <p className="text-sm font-semibold text-stone-700">{formatRupiah(item.unitPrice * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Section - only for completed orders */}
              {order.status === "SELESAI" && (
                <div className="px-5 pb-4">
                  {allItemsReviewed(order) ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-xl px-4 py-2.5">
                      <FiCheckCircle size={13} />
                      <span className="font-medium">Ulasan telah dikirim untuk semua item</span>
                    </div>
                  ) : reviewingOrder === order.id ? (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                        <FiStar size={14} className="text-amber-500" /> Beri Ulasan
                      </h4>
                      {order.items.map((item) => {
                        if (getReview(order.id, item.menuId)) return null;
                        const key = reviewKey(order.id, item.menuId);
                        return (
                          <div key={item.id} className="bg-white rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-stone-700">{item.menu.name}</p>
                            <StarRating
                              value={reviewRatings[key] || 0}
                              onChange={(v) => setReviewRatings((prev) => ({ ...prev, [key]: v }))}
                            />
                            <input
                              type="text"
                              placeholder="Tulis komentar (opsional)..."
                              value={reviewComments[key] || ""}
                              onChange={(e) => setReviewComments((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400"
                            />
                          </div>
                        );
                      })}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReviewingOrder(null)}
                          className="flex-1 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50"
                        >Batal</button>
                        <button
                          onClick={() => handleSubmitReviews(order)}
                          disabled={submittingReview || !order.items.some((item) => !getReview(order.id, item.menuId) && reviewRatings[reviewKey(order.id, item.menuId)] > 0)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-40"
                        >
                          {submittingReview ? "Mengirim..." : <><FiSend size={13} /> Kirim Ulasan</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-amber-200 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors text-sm font-medium"
                    >
                      <FiStar size={14} /> Beri Ulasan
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
