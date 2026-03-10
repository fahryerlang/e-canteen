"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiBell, FiX, FiCheckCircle } from "react-icons/fi";

interface Notification {
  id: string;
  message: string;
  time: Date;
}

export default function OrderNotification({ role }: { role: "SELLER" | "ADMIN" | "USER" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastOrderCountRef = useRef<number | null>(null);
  const lastReadyCountRef = useRef<number | null>(null);
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
    const endpoint = role === "SELLER" ? "/api/seller/orders" : role === "ADMIN" ? "/api/orders" : "/api/orders";

    const checkOrders = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!Array.isArray(data)) return;

        if (role === "USER") {
          // For users: notify when orders become SIAP_DIAMBIL
          const readyOrders = data.filter((o: { status: string }) => o.status === "SIAP_DIAMBIL");
          const readyCount = readyOrders.length;

          if (lastReadyCountRef.current !== null && readyCount > lastReadyCountRef.current) {
            const diff = readyCount - lastReadyCountRef.current;
            const newNotif: Notification = {
              id: Date.now().toString(),
              message: `${diff} pesanan siap diambil!`,
              time: new Date(),
            };
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
          }

          lastReadyCountRef.current = readyCount;
        } else {
          // For sellers/admins: notify when new DIPROSES orders come in
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
        }
      } catch {
        // Ignore errors
      }
    };

    // Initial check
    checkOrders();

    // Poll every 10 seconds for more responsive notifications
    const interval = setInterval(checkOrders, 10000);
    
    // Listen for badge refresh events from order updates
    const handleBadgeRefresh = () => checkOrders();
    window.addEventListener("badge-refresh", handleBadgeRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("badge-refresh", handleBadgeRefresh);
    };
  }, [role, playNotificationSound]);

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Notification button and badge removed, notifications are now in sidebar */}

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
