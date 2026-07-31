"use client";

import React from "react";
import { User, Store, ShieldCheck, Mail, Phone } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerProfilePage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const assignedBranch = branches.find((b) => b.id === user?.branchId) || branches[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-amber-600" /> Branch Manager Profile
        </h1>
        <p className="text-xs text-slate-500">Your account credentials and branch assignment details</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-xl space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
            {user?.name?.[0] || "M"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || "Branch Manager"}</h2>
            <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Role: branchManager
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Manager Email</span>
            <span className="font-mono text-slate-900 font-bold">{user?.email}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Assigned Branch</span>
            <span className="font-bold text-slate-900">{assignedBranch?.name} ({assignedBranch?.location?.city})</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Parent Restaurant</span>
            <span className="font-bold text-slate-900">{assignedBranch?.restaurantName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
