"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  Store,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

export const OwnerSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logoutOwner, ownerUser } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NAV_ITEMS = [
    { name: "Owner Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "My Branches", href: "/owner/branches", icon: GitBranch },
    { name: "Menu & Products", href: "/owner/products", icon: UtensilsCrossed },
    { name: "Categories", href: "/owner/categories", icon: Layers },
    { name: "Live Orders", href: "/owner/orders", icon: ShoppingBag },
    { name: "Customers", href: "/owner/customers", icon: Users },
    { name: "Offers & Promos", href: "/owner/offers", icon: Tag },
    { name: "Sales Analytics", href: "/owner/analytics", icon: BarChart3 },
    { name: "Business Profile", href: "/owner/profile", icon: User },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-white border-r border-orange-100 shadow-sm flex flex-col z-30 select-none transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-orange-100/60">
        <Link href="/owner/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
            <Store className="w-5 h-5 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-stone-900 leading-tight">
                {ownerUser?.restaurantName || "Food Kingdom"}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B35]">
                Owner Portal
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B35] flex items-center justify-center transition-colors shrink-0"
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
                "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white shadow-md shadow-orange-500/20"
                  : "text-stone-600 hover:bg-orange-50 hover:text-[#FF6B35]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-stone-500 group-hover:text-[#FF6B35]"
                )}
              />

              {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-orange-100 bg-stone-50/60">
        <Link
          href="/owner/login"
          onClick={logoutOwner}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 text-stone-400 shrink-0" />
          {!isCollapsed && <span>Logout Owner</span>}
        </Link>
      </div>
    </aside>
  );
};
