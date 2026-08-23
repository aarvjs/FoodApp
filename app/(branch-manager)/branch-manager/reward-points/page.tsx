"use client";

import React, { useState, useEffect } from "react";
import { Coins, Building2, MapPin, History, RefreshCw, Search, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { RewardConfigForm } from "@/components/reward/RewardConfigForm";
import { rewardConfigRepository } from "@/repositories/rewardConfigRepository";

export default function BranchManagerRewardPointsPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);

  const assignedBranch =
    branches.find((b) => b.id === user?.assignedBranchId || b.id === user?.branchId) ||
    branches[0];

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(true);
  const [txSearch, setTxSearch] = useState<string>("");

  const loadBranchTransactions = async () => {
    if (!assignedBranch?.id) return;
    setIsLoadingTx(true);
    try {
      const data = await rewardConfigRepository.getRewardTransactions({
        branchId: assignedBranch.id
      });
      setTransactions(data);
    } catch (e) {
      console.warn("Failed to load branch reward transactions:", e);
    } finally {
      setIsLoadingTx(false);
    }
  };

  useEffect(() => {
    loadBranchTransactions();
  }, [assignedBranch?.id]);

  const totalEarned = transactions
    .filter((t) => (t.type || t.transactionType) === "EARNED")
    .reduce((sum, t) => sum + Math.abs(Number(t.points || 0)), 0);

  const totalRedeemed = transactions
    .filter((t) => (t.type || t.transactionType) === "REDEEMED")
    .reduce((sum, t) => sum + Math.abs(Number(t.points || 0)), 0);

  const totalDiscount = transactions
    .filter((t) => (t.type || t.transactionType) === "REDEEMED")
    .reduce((sum, t) => sum + Number(t.monetaryValue || 0), 0);

  const displayedTransactions = transactions.filter((t) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      (t.orderNumber && t.orderNumber.toLowerCase().includes(q)) ||
      (t.userId && t.userId.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Coins className="w-7 h-7 text-amber-500" /> Branch Reward Points & Tiers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage reward slabs, point values, and view customer reward activity strictly for {assignedBranch?.name || "your branch"}
          </p>
        </div>

        <button
          onClick={loadBranchTransactions}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? "animate-spin" : ""}`} /> Refresh Activity
        </button>
      </div>

      {/* Assigned Branch Security Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Authorized Branch Operational Scope
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            {assignedBranch?.name || "Branch Office"}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
            {assignedBranch?.address || assignedBranch?.location?.formattedAddress || "Location configured"}
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

      {/* Branch Specific Activity Widgets */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-amber-500" /> Branch Customer Reward Activity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Points Issued */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch Points Issued</div>
              <div className="text-xl font-black text-emerald-600">+{totalEarned}</div>
            </div>
          </div>

          {/* Card 2: Points Redeemed */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch Points Redeemed</div>
              <div className="text-xl font-black text-orange-600">-{totalRedeemed}</div>
            </div>
          </div>

          {/* Card 3: Total Reward Discount */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch Reward Discount</div>
              <div className="text-xl font-black text-amber-600">₹{totalDiscount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Branch Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch Reward Activity Log</h3>
              <p className="text-xs text-slate-500">Customer point credits and redemptions for this branch</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order or customer..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 w-full sm:w-56"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-right">Points</th>
                  <th className="px-4 py-3 text-right pr-6">Discount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No customer reward activity recorded for this branch yet.
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((tx) => {
                    const type = (tx.type || tx.transactionType || "EARNED").toUpperCase();
                    const isEarned = type === "EARNED";

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {new Date(tx.createdAt || tx.timestamp || Date.now()).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-900">
                          {tx.orderNumber ? `#${tx.orderNumber}` : "N/A"}
                        </td>

                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                          {tx.userId || tx.customerId || "Customer"}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isEarned
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {type}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right font-black">
                          <span className={isEarned ? "text-emerald-600" : "text-rose-600"}>
                            {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right pr-6 font-bold text-slate-900">
                          ₹{Number(tx.monetaryValue || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
