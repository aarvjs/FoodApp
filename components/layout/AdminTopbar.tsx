"use client";

import React from "react";
import { Bell, ShieldCheck, Store, Menu } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMenuClick }) => {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const selectedBranchId = useStore((state) => state.selectedBranchId);
  const setSelectedBranchId = useStore((state) => state.setSelectedBranchId);
  const setSelectedRestaurantId = useStore((state) => state.setSelectedRestaurantId);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    if (!bId) {
      setSelectedBranchId(null);
      setSelectedRestaurantId(null);
    } else {
      const selected = branches.find((b) => b.id === bId);
      setSelectedBranchId(bId);
      if (selected?.restaurantId) {
        setSelectedRestaurantId(selected.restaurantId);
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm gap-2">
      {/* Hamburger & Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight truncate">
          Super Admin
        </h2>
        <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" /> Full System Access
        </span>
      </div>

      {/* Center: Branch Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/80 p-1 sm:p-1.5 px-2 sm:px-3 rounded-xl border border-slate-200 max-w-[160px] sm:max-w-xs shrink-0">
        <Store className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-xs font-bold text-slate-600 hidden md:inline shrink-0">Active Branch:</span>
        <select
          value={selectedBranchId || ""}
          onChange={handleBranchChange}
          className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-900 focus:outline-none cursor-pointer truncate w-full"
        >
          <option value="">All Branches Overview</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name || b.branchName} ({b.restaurantName || "Main"})
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <button className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors">
          <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow shrink-0">
            {user?.name?.[0] || "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || "Super Admin"}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{user?.email || "admin@foodsystem.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
