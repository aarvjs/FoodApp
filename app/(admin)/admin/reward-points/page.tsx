"use client";

import React, { useState, useEffect } from "react";
import { Coins, Building2, MapPin } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { RewardConfigForm } from "@/components/reward/RewardConfigForm";

export default function AdminRewardPointsPage() {
  const restaurants = useStore((state) => state.restaurants);
  const branches = useStore((state) => state.branches);
  const currentUser = useStore((state) => state.user);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  const filteredBranches = branches.filter(
    (b) => !selectedRestaurantId || b.restaurantId === selectedRestaurantId
  );

  useEffect(() => {
    if (filteredBranches.length > 0) {
      if (!selectedBranchId || !filteredBranches.some((b) => b.id === selectedBranchId)) {
        setSelectedBranchId(filteredBranches[0].id);
      }
    } else {
      setSelectedBranchId("");
    }
  }, [selectedRestaurantId, filteredBranches, selectedBranchId]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Coins className="w-7 h-7 text-amber-500" /> Reward Points Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define order threshold eligibility and reward points credited to customers per restaurant branch
        </p>
      </div>

      {/* Restaurant & Branch Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Restaurant Selector */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-500" /> Select Restaurant
          </label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            {restaurants.length === 0 ? (
              <option value="">No Restaurants Found</option>
            ) : (
              restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Branch Selector */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" /> Select Branch
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            {filteredBranches.length === 0 ? (
              <option value="">No Branches Available</option>
            ) : (
              filteredBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.location?.city || "Branch"})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Configuration Form Card */}
      {selectedBranchId ? (
        <RewardConfigForm
          restaurantId={selectedRestaurantId || activeBranch?.restaurantId || ""}
          branchId={selectedBranchId}
          branchName={activeBranch?.name || "Selected Branch"}
          currentUserRole="admin"
          currentUserName={currentUser?.name || "Super Admin"}
        />
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 space-y-2">
          <Coins className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700 text-sm">No Branch Selected</p>
          <p className="text-xs text-slate-500">Please select a valid restaurant and branch above to configure reward points.</p>
        </div>
      )}
    </div>
  );
}
