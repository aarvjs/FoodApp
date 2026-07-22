"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Store,
  GitBranch,
  ShieldCheck,
  Plus,
  CheckCircle2,
  X,
  ChefHat,
  Truck,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { UserRole } from "@/types";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

export const Topbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    restaurants,
    branches,
    selectedRestaurantId,
    setSelectedRestaurantId,
    selectedBranchId,
    setSelectedBranchId,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useAppStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const rolesList: { role: UserRole; label: string; icon: React.ElementType }[] = [
    { role: "SUPER_ADMIN", label: "Super Admin", icon: ShieldCheck },
    { role: "OWNER", label: "Restaurant Owner", icon: Store },
    { role: "BRANCH_MANAGER", label: "Branch Manager", icon: GitBranch },
    { role: "KITCHEN_STAFF", label: "Kitchen Staff", icon: ChefHat },
    { role: "DELIVERY_BOY", label: "Delivery Agent", icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-20 h-18 bg-white/90 backdrop-blur-md border-b border-orange-100/80 px-6 flex items-center justify-between gap-4">
      {/* Left Section: Selectors & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Restaurant Selector */}
        {(currentRole === "SUPER_ADMIN" || currentRole === "OWNER") && (
          <div className="relative hidden md:flex items-center">
            <Store className="w-4 h-4 text-orange-500 absolute left-3 pointer-events-none" />
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="pl-9 pr-8 py-2 bg-orange-50/50 hover:bg-orange-50 border border-orange-200/80 rounded-xl text-xs font-semibold text-stone-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="ALL">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Branch Selector */}
        {currentRole !== "KITCHEN_STAFF" && currentRole !== "DELIVERY_BOY" && (
          <div className="relative hidden sm:flex items-center">
            <GitBranch className="w-4 h-4 text-amber-500 absolute left-3 pointer-events-none" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="pl-9 pr-8 py-2 bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-semibold text-stone-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFA726]"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, dishes, branches..."
            className="w-full pl-10 pr-4 py-2 bg-stone-100/70 focus:bg-white border border-stone-200/80 focus:border-[#FF6B35] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Section: Role Simulator + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Role Simulator Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 hover:border-orange-300 text-stone-800 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Role: {currentRole.replace("_", " ")}
            </span>
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <p className="text-xs font-bold text-stone-900">Switch Demo Role</p>
                <p className="text-[11px] text-stone-400">Simulate permissions view</p>
              </div>
              {rolesList.map((r) => {
                const IconComp = r.icon;
                const isSelected = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentRole(r.role);
                      setIsRoleMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors mb-0.5",
                      isSelected
                        ? "bg-orange-50 text-[#FF6B35] font-bold"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className="w-4 h-4 text-orange-500" />
                      <span>{r.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 rounded-xl bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-[#FF6B35] flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B35] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-stone-400 hover:text-[#FF6B35]"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="py-2 max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs cursor-pointer transition-colors",
                        n.read
                          ? "bg-stone-50/50 border-stone-100 text-stone-500"
                          : "bg-orange-50/60 border-orange-100 text-stone-800 font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{n.title}</span>
                        <span className="text-[10px] text-stone-400">{n.time}</span>
                      </div>
                      <p className="text-stone-600 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Quick Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200/80">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="User avatar"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-orange-200"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-stone-900 leading-tight">
              Vikram Malhotra
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              Food Kingdom HQ
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
