"use client";

import React from "react";
import { Coins, Building2, MapPin } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { RewardConfigForm } from "@/components/reward/RewardConfigForm";

export default function BranchManagerRewardPointsPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);

  const assignedBranch =
    branches.find((b) => b.id === user?.assignedBranchId || b.id === user?.branchId) ||
    branches[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Coins className="w-7 h-7 text-amber-500" /> Branch Reward Points Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure order threshold eligibility and reward points credited for {assignedBranch?.name || "your branch"}
        </p>
      </div>

      {/* Assigned Branch Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Branch
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            {assignedBranch?.name || "Branch Office"}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
            {assignedBranch?.address || assignedBranch?.location?.formattedAddress || "Location set"}
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      {assignedBranch ? (
        <RewardConfigForm
          restaurantId={assignedBranch.restaurantId}
          branchId={assignedBranch.id}
          branchName={assignedBranch.name}
          currentUserRole="branch_manager"
          currentUserName={user?.name || "Branch Manager"}
        />
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 space-y-2">
          <Coins className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700 text-sm">No Branch Assigned</p>
          <p className="text-xs text-slate-500">You do not have an assigned branch associated with your account.</p>
        </div>
      )}
    </div>
  );
}
