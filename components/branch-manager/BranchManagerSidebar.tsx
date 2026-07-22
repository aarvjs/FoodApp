"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Users,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  MapPin,
  Flame,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

export const BranchManagerSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logoutBranchManager, branchManagerUser } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NAV_ITEMS = [
    { name: "Branch Dashboard", href: "/branch-manager/dashboard", icon: LayoutDashboard },
    { name: "Branch Orders", href: "/branch-manager/orders", icon: ShoppingBag, badge: "Live" },
    { name: "Kitchen KDS", href: "/branch-manager/kitchen", icon: ChefHat },
    { name: "Branch Menu", href: "/branch-manager/products", icon: UtensilsCrossed },
    { name: "Branch Customers", href: "/branch-manager/customers", icon: Users },
    { name: "Daily Reports", href: "/branch-manager/reports", icon: BarChart3 },
    { name: "Manager Profile", href: "/branch-manager/profile", icon: User },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-stone-900 text-stone-200 border-r border-stone-800 flex flex-col z-30 select-none transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Branch Header Banner */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-stone-800 bg-stone-950">
        <Link href="/branch-manager/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <GitBranch className="w-5 h-5 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-tight truncate">
                {branchManagerUser?.assignedBranchName || "Kanpur Outlet"}
              </span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-400">
                Branch Manager Portal
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                  : "text-stone-400 hover:bg-stone-800 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-stone-400 group-hover:text-amber-400"
                )}
              />

              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}

              {!isCollapsed && item.badge && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Branch Isolation Banner Footer */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/80 space-y-2">
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Restricted: {branchManagerUser?.assignedBranchName || "Kanpur"} Data Only
            </span>
          </div>
        )}
        <Link
          href="/branch-manager/login"
          onClick={logoutBranchManager}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-stone-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 text-stone-500 shrink-0" />
          {!isCollapsed && <span>Sign Out Manager</span>}
        </Link>
      </div>
    </aside>
  );
};
