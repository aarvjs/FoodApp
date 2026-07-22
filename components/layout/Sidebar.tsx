"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  GitBranch,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Users,
  ChefHat,
  Truck,
  UserCheck,
  Tag,
  Ticket,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentRole, isSidebarCollapsed, toggleSidebar, orders } = useAppStore();

  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING").length;

  const NAV_ITEMS: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER", "KITCHEN_STAFF", "DELIVERY_BOY"],
    },
    {
      name: "Restaurants",
      href: "/restaurants",
      icon: Store,
      roles: ["SUPER_ADMIN", "OWNER"],
    },
    {
      name: "Branches",
      href: "/branches",
      icon: GitBranch,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER", "KITCHEN_STAFF", "DELIVERY_BOY"],
    },
    {
      name: "Products",
      href: "/products",
      icon: UtensilsCrossed,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER", "KITCHEN_STAFF"],
    },
    {
      name: "Categories",
      href: "/categories",
      icon: Layers,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Kitchen Panel",
      href: "/kitchen",
      icon: ChefHat,
      badge: 3,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER", "KITCHEN_STAFF"],
    },
    {
      name: "Delivery Panel",
      href: "/delivery",
      icon: Truck,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER", "DELIVERY_BOY"],
    },
    {
      name: "Staff & Roles",
      href: "/staff",
      icon: UserCheck,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Special Offers",
      href: "/offers",
      icon: Tag,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Coupons",
      href: "/coupons",
      icon: Ticket,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER"],
    },
    {
      name: "My Profile",
      href: "/profile",
      icon: User,
      roles: ["SUPER_ADMIN", "OWNER", "BRANCH_MANAGER", "KITCHEN_STAFF", "DELIVERY_BOY"],
    },
  ];

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 h-screen bg-white border-r border-orange-100/80 shadow-sm flex flex-col z-30 select-none overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-orange-100/60">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
            <Flame className="w-6 h-6 fill-white stroke-none" />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-extrabold text-lg tracking-tight text-stone-900 leading-tight">
                  Food<span className="text-[#FF6B35]">Kingdom</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 w-max">
                  Admin ERP
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B35] flex items-center justify-center transition-colors shrink-0"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white shadow-md shadow-orange-500/20 font-semibold"
                  : "text-stone-600 hover:bg-orange-50/80 hover:text-[#FF6B35]"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-stone-500 group-hover:text-[#FF6B35]"
                )}
              />

              {!isSidebarCollapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}

              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-bold shadow-sm",
                    isActive
                      ? "bg-white text-[#FF6B35]"
                      : "bg-[#FF6B35] text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer / Logout */}
      <div className="p-3 border-t border-orange-100/60 bg-stone-50/50">
        <Link
          href="/auth/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 text-stone-400 group-hover:text-rose-600 shrink-0" />
          {!isSidebarCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </motion.aside>
  );
};
