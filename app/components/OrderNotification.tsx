"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiBell, FiX, FiCheckCircle } from "react-icons/fi";

interface Notification {
  id: string;
  message: string;
  time: Date;
}

export default function OrderNotification({ role }: { role: "SELLER" | "ADMIN" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastOrderCountRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create a beep sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gain.gain.value = 0.3;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  }, []);

  useEffect(() => {
    const endpoint = role === "SELLER" ? "/api/seller/orders" : "/api/orders";

    const checkOrders = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const activeOrders = data.filter((o: { status: string }) => o.status === "DIPROSES");
        const currentCount = activeOrders.length;

        if (lastOrderCountRef.current !== null && currentCount > lastOrderCountRef.current) {
          const diff = currentCount - lastOrderCountRef.current;
          const newNotif: Notification = {
            id: Date.now().toString(),
            message: `${diff} pesanan baru masuk!`,
            time: new Date(),
          };
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
          playNotificationSound();
        }

        lastOrderCountRef.current = currentCount;
      } catch {
        // Ignore errors
      }
    };

    // Initial check
    checkOrders();

    // Poll every 10 seconds for more responsive notifications
    const interval = setInterval(checkOrders, 10000);
    return () => clearInterval(interval);
  }, [role, playNotificationSound]);

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setShowPanel(!showPanel); if (!showPanel) setUnreadCount(0); }}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        title="Notifikasi"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <h3 className="font-semibold text-stone-800 text-sm">Notifikasi</h3>
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-green-700 font-medium hover:underline">
                  Hapus semua
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <FiCheckCircle size={24} className="mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-stone-50 hover:bg-stone-50/50">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <FiBell size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-700">{n.message}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {n.time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
