"use client";

import React from "react";
import { Bell, Store, CircleCheck, Menu } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

interface BranchManagerTopbarProps {
  onMenuClick?: () => void;
}

export const BranchManagerTopbar: React.FC<BranchManagerTopbarProps> = ({ onMenuClick }) => {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);

  const assignedBranch = branches.find((b) => b.id === (user?.assignedBranchId || user?.branchId)) || branches[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm gap-2">
      {/* Title & Assigned Branch Info */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight truncate">
          Branch Manager
        </h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] sm:text-xs font-semibold rounded-full border border-amber-200/80 truncate max-w-[140px] sm:max-w-none">
          <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{assignedBranch?.name || "Branch Portal"}</span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Status Badge */}
        <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <CircleCheck className="w-3.5 h-3.5" /> Branch Live
        </span>

        {/* Notifications */}
        <button className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors">
          <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs sm:text-sm shadow shrink-0">
            {user?.name?.[0] || "M"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || "Branch Manager"}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{user?.email || "manager@branch.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
