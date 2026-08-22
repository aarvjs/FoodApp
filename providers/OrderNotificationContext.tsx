"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/lib/store/useStore";
import { Order } from "@/types";
import { notificationAudio } from "@/utils/notificationAudio";

export interface OrderNotificationItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  branchId: string;
  branchName: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  read: boolean;
}

interface OrderNotificationContextType {
  notifications: OrderNotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  requestBrowserNotificationPermission: () => void;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

const PROCESSED_IDS_STORAGE_KEY = "food_admin_processed_order_ids_v1";
const NOTIFICATIONS_STORAGE_KEY = "food_admin_order_notifications_v1";

export const OrderNotificationProvider: React.FC<{
  children: React.ReactNode;
  role: "admin" | "branchManager";
}> = ({ children, role }) => {
  const { user } = useAuth();
  const router = useRouter();
  const selectedBranchId = useStore((state) => state.selectedBranchId);
  const branches = useStore((state) => state.branches);

  const [notifications, setNotifications] = useState<OrderNotificationItem[]>([]);
  const isInitialLoadRef = useRef<boolean>(true);
  const processedOrderIdsRef = useRef<Set<string>>(new Set());

  // Branch ID for Branch Manager
  const managerBranchId = user?.assignedBranchId || user?.branchId;

  // Load persisted processed order IDs and saved notifications on mount
  useEffect(() => {
    try {
      const storedProcessed = localStorage.getItem(PROCESSED_IDS_STORAGE_KEY);
      if (storedProcessed) {
        const parsed = JSON.parse(storedProcessed);
        if (Array.isArray(parsed)) {
          processedOrderIdsRef.current = new Set(parsed);
        }
      }

      const storedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifs) {
        const parsed = JSON.parse(storedNotifs);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch (e) {
      console.warn("Error restoring notification state from localStorage:", e);
    }
  }, []);

  // Save notifications to localStorage whenever state updates
  const updateNotifications = (newNotifs: OrderNotificationItem[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifs.slice(0, 100)));
    } catch (e) {
      console.warn("Failed to persist notifications:", e);
    }
  };

  // Helper to persist processed order IDs
  const markOrderAsProcessed = (orderId: string) => {
    processedOrderIdsRef.current.add(orderId);
    try {
      const arrayToSave = Array.from(processedOrderIdsRef.current).slice(-500);
      localStorage.setItem(PROCESSED_IDS_STORAGE_KEY, JSON.stringify(arrayToSave));
    } catch (e) {
      console.warn("Failed to persist processed order IDs:", e);
    }
  };

  // Real-time Firestore Listener for New Orders
  useEffect(() => {
    if (!user) return;

    let ordersQuery;
    if (role === "branchManager") {
      if (!managerBranchId) return;
      ordersQuery = query(
        collection(db, "orders"),
        where("branchId", "==", managerBranchId)
      );
    } else {
      // Super Admin receives orders from ALL branches
      ordersQuery = collection(db, "orders");
    }

    isInitialLoadRef.current = true;

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const currentOrders: Order[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Order));

        if (isInitialLoadRef.current) {
          // On initial load, mark all existing orders as seen/processed
          currentOrders.forEach((ord) => {
            if (ord.id) {
              processedOrderIdsRef.current.add(ord.id);
            }
          });
          try {
            const arrayToSave = Array.from(processedOrderIdsRef.current).slice(-500);
            localStorage.setItem(PROCESSED_IDS_STORAGE_KEY, JSON.stringify(arrayToSave));
          } catch (e) {}

          isInitialLoadRef.current = false;
          return;
        }

        // Process doc changes for genuinely NEW orders
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newOrder = { id: change.doc.id, ...change.doc.data() } as Order;

            if (!newOrder.id) return;

            // DUPLICATE PROTECTION: Ensure order ID hasn't been processed yet
            if (processedOrderIdsRef.current.has(newOrder.id)) {
              return;
            }

            // Role / Branch Filtering Check
            if (role === "branchManager" && managerBranchId && newOrder.branchId !== managerBranchId) {
              return;
            }

            // Mark order as processed immediately
            markOrderAsProcessed(newOrder.id);

            // 1. Play 2-Second MP3 Sound Alert
            notificationAudio.playNewOrderSound();

            // 2. Resolve branch name
            const foundBranch = branches.find((b) => b.id === newOrder.branchId);
            const branchNameStr = newOrder.branchName || foundBranch?.name || foundBranch?.branchName || "Main Branch";

            // 3. Create Notification Item
            const notifItem: OrderNotificationItem = {
              id: `notif_${newOrder.id}_${Date.now()}`,
              orderId: newOrder.id,
              orderNumber: newOrder.orderNumber || newOrder.id.slice(0, 8),
              customerName: newOrder.customerName || "Guest Customer",
              totalAmount: newOrder.totalAmount || 0,
              branchId: newOrder.branchId || "",
              branchName: branchNameStr,
              paymentMethod: newOrder.paymentMethod || "COD",
              paymentStatus: newOrder.paymentStatus || "PENDING",
              createdAt: newOrder.createdAt || new Date().toISOString(),
              read: false
            };

            setNotifications((prev) => {
              const updated = [notifItem, ...prev];
              try {
                localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
              } catch (e) {}
              return updated;
            });

            // 4. Optional Browser Notification
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification("New Order Received", {
                  body: `Order #${notifItem.orderNumber} - ₹${notifItem.totalAmount} (${notifItem.branchName})`,
                  icon: "/favicon.ico"
                });
              } catch (err) {}
            }
          }
        });
      },
      (err) => {
        console.warn("Order Notification Listener Error:", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, role, managerBranchId, branches]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
      } catch (e) {}
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
      } catch (e) {}
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (e) {}
  };

  const requestBrowserNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <OrderNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        requestBrowserNotificationPermission
      }}
    >
      {children}
    </OrderNotificationContext.Provider>
  );
};

export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationContext);
  if (!context) {
    throw new Error("useOrderNotifications must be used within an OrderNotificationProvider");
  }
  return context;
};
