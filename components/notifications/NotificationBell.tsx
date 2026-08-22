"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, ShoppingBag, CheckCheck, Clock, ArrowRight, Volume2, ShieldAlert } from "lucide-react";
import { useOrderNotifications, OrderNotificationItem } from "@/providers/OrderNotificationContext";
import { useRouter, usePathname } from "next/navigation";

interface NotificationBellProps {
  role: "admin" | "branchManager";
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ role }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, requestBrowserNotificationPermission } = useOrderNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 30) return "Just now";
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  const handleNotificationClick = (item: OrderNotificationItem) => {
    // 1. Mark notification as read (does NOT touch order status)
    markAsRead(item.id);

    // 2. Navigate to existing Order details/pipeline page
    const targetRoute = role === "admin" ? "/admin/orders" : "/branch-manager/orders";
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const badgeDisplay = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-all flex items-center justify-center"
        aria-label="Order Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse shadow-sm">
            {badgeDisplay}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Panel Header */}
          <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100">Order Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Enable Browser Notifications banner if not granted */}
          {typeof window !== "undefined" && "Notification" in window && Notification.permission === "default" && (
            <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-3.5 flex items-center justify-between text-xs text-amber-900">
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <Volume2 className="w-4 h-4 text-amber-600 shrink-0" /> Allow popup notifications?
              </span>
              <button
                onClick={requestBrowserNotificationPermission}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow-sm"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[380px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600">No order notifications yet</p>
                <p className="text-[10px] text-slate-400">New customer orders will trigger real-time sound and alert cards here.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer relative group flex gap-3 ${
                    !item.read ? "bg-emerald-50/40" : "bg-white"
                  }`}
                >
                  {/* Unread Indicator */}
                  {!item.read && (
                    <span className="absolute top-4 left-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
                  )}

                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <ShoppingBag className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        New Order Received
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-extrabold text-slate-800">{item.orderNumber}</span>
                      <span className="font-extrabold text-emerald-600">₹{item.totalAmount}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-medium flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>Cust: <strong>{item.customerName}</strong></span>
                      <span>•</span>
                      <span className="text-slate-800 font-semibold">{item.branchName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Payment: {item.paymentMethod} ({item.paymentStatus})</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Order <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center">
            <button
              onClick={() => {
                const targetRoute = role === "admin" ? "/admin/orders" : "/branch-manager/orders";
                if (pathname !== targetRoute) router.push(targetRoute);
                setIsOpen(false);
              }}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
            >
              Go to Order Pipeline Monitor <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
