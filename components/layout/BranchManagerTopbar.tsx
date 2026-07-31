"use client";

import React from "react";
import { Bell, Store, ShieldAlert, CircleCheck } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export const BranchManagerTopbar: React.FC = () => {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);

  const assignedBranch = branches.find((b) => b.id === (user?.assignedBranchId || user?.branchId)) || branches[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Title & Assigned Branch Info */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          Branch Manager Portal
        </h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200/80">
          <Store className="w-3.5 h-3.5 text-amber-600" />
          Assigned: {assignedBranch?.name || "Branch Portal"}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <CircleCheck className="w-3.5 h-3.5" /> Branch Live
        </span>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow">
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
