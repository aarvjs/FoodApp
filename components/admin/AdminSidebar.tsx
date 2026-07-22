"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  GitBranch,
  UserCheck,
  Building2,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logoutAdmin } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NAV_ITEMS = [
    { name: "Admin Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Restaurants", href: "/admin/restaurants", icon: Store },
    { name: "Branches", href: "/admin/branches", icon: GitBranch },
    { name: "Branch Managers", href: "/admin/branch-managers", icon: UserCheck, badge: "Crucial" },
    { name: "Owner Accounts", href: "/admin/owners", icon: Building2 },
    { name: "Global Menu", href: "/admin/products", icon: UtensilsCrossed },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "All Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Delivery Logistics", href: "/admin/delivery", icon: Truck },
    { name: "Network Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-stone-950 text-stone-300 border-r border-stone-800 flex flex-col z-30 select-none transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-stone-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                Super<span className="text-[#FF6B35]">Admin</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-orange-400">
                HQ Platform ERP
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold shadow-md shadow-orange-500/20"
                  : "text-stone-400 hover:bg-stone-900 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-stone-400 group-hover:text-[#FF6B35]"
                )}
              />

              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}

              {!isCollapsed && item.badge && (
                <span className="text-[10px] bg-orange-500/20 text-[#FF6B35] px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-stone-900 bg-stone-900/50">
        <Link
          href="/admin/login"
          onClick={logoutAdmin}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 text-stone-500 shrink-0" />
          {!isCollapsed && <span>Sign Out Admin</span>}
        </Link>
      </div>
    </aside>
  );
};
