"use client";

import React, { useState } from "react";
import { Search, Bell, Store, GitBranch } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAppStore } from "@/lib/store/useAppStore";

export const OwnerTopbar: React.FC = () => {
  const { ownerUser } = useAuthStore();
  const { branches, selectedBranchId, setSelectedBranchId } = useAppStore();
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-20 h-18 bg-white/90 backdrop-blur-md border-b border-orange-100 px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Branch Scope Dropdown */}
        <div className="relative hidden sm:flex items-center">
          <GitBranch className="w-4 h-4 text-amber-500 absolute left-3 pointer-events-none" />
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="pl-9 pr-8 py-2 bg-amber-50/60 hover:bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FFA726]"
          >
            <option value="ALL">All Outlets</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, dishes, customers..."
            className="w-full pl-10 pr-4 py-2 bg-stone-100/70 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>
      </div>

      {/* Right User Card */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
          <img
            src={
              ownerUser?.avatar ||
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
            }
            alt="Owner"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-orange-200"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-stone-900 leading-tight">
              {ownerUser?.name || "Rajesh Sharma"}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">
              Owner ({ownerUser?.restaurantName || "Food Kingdom"})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
