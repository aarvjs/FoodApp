"use client";

import React, { useState } from "react";
import { Search, GitBranch, MapPin, ChefHat } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export const BranchManagerTopbar: React.FC = () => {
  const { branchManagerUser } = useAuthStore();
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-20 h-18 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 px-6 flex items-center justify-between gap-4 text-white">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${branchManagerUser?.assignedBranchName || "Kanpur"} orders, kitchen, products...`}
          className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <MapPin className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {branchManagerUser?.assignedBranchName || "Kanpur Branch"}
          </span>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-stone-800">
          <img
            src={
              branchManagerUser?.avatar ||
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
            }
            alt="Branch Manager"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-500/50"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {branchManagerUser?.name || "Amit Verma"}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              Manager ({branchManagerUser?.assignedBranchName || "Kanpur"})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
