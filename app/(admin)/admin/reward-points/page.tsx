"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Building2,
  MapPin,
  Globe,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  Users,
  ShoppingBag,
  History
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { RewardConfigForm } from "@/components/reward/RewardConfigForm";
import { rewardConfigRepository } from "@/repositories/rewardConfigRepository";

export default function AdminRewardPointsPage() {
  const restaurants = useStore((state) => state.restaurants);
  const branches = useStore((state) => state.branches);
  const currentUser = useStore((state) => state.user);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(true);
  const [txSearch, setTxSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  const filteredBranches = branches.filter(
    (b) => !selectedRestaurantId || b.restaurantId === selectedRestaurantId
  );

  const loadRewardDashboardData = async () => {
    setIsLoadingTx(true);
    try {
      const data = await rewardConfigRepository.getRewardTransactions({
        branchId: selectedBranchId === "ALL" ? undefined : selectedBranchId
      });
      setTransactions(data);
    } catch (e) {
      console.warn("Failed to load reward transactions:", e);
    } finally {
      setIsLoadingTx(false);
    }
  };

  useEffect(() => {
    loadRewardDashboardData();
  }, [selectedBranchId]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const selectedBranchName = selectedBranchId === "ALL" ? "All / Both Branches (Global)" : activeBranch?.name || "Selected Branch";

  // Dashboard Aggregates
  const totalEarnedPoints = transactions
    .filter((t) => (t.type || t.transactionType) === "EARNED")
    .reduce((sum, t) => sum + Math.abs(Number(t.points || 0)), 0);

  const totalRedeemedPoints = transactions
    .filter((t) => (t.type || t.transactionType) === "REDEEMED")
    .reduce((sum, t) => sum + Math.abs(Number(t.points || 0)), 0);

  const totalMonetaryDiscount = transactions
    .filter((t) => (t.type || t.transactionType) === "REDEEMED")
    .reduce((sum, t) => sum + Number(t.monetaryValue || 0), 0);

  // Filtered transactions for table
  const displayedTransactions = transactions.filter((t) => {
    const typeStr = (t.type || t.transactionType || "").toUpperCase();
    if (filterType !== "ALL" && typeStr !== filterType) return false;

    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      (t.orderNumber && t.orderNumber.toLowerCase().includes(q)) ||
      (t.orderId && t.orderId.toLowerCase().includes(q)) ||
      (t.userId && t.userId.toLowerCase().includes(q)) ||
      (t.customerId && t.customerId.toLowerCase().includes(q)) ||
      (t.branchName && t.branchName.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Coins className="w-7 h-7 text-amber-500" /> Global Reward Points Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic order slabs, point values, branch overrides, and audit real-time customer reward activity
          </p>
        </div>

        <button
          onClick={loadRewardDashboardData}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? "animate-spin" : ""}`} /> Refresh Dashboard
        </button>
      </div>

      {/* Restaurant & Branch Scope Selectors */}
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

        {/* Branch Scope Selector */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-500" /> Branch Target Scope
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="ALL">🌐 ALL / BOTH BRANCHES (Global Default Configuration)</option>
            {filteredBranches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 Branch: {b.name} ({b.location?.city || "Location set"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Configuration Form Card */}
      <RewardConfigForm
        restaurantId={selectedRestaurantId || activeBranch?.restaurantId || "default"}
        branchId={selectedBranchId}
        branchName={selectedBranchName}
        currentUserRole="admin"
        currentUserName={currentUser?.name || "Super Admin"}
      />

      {/* Admin Analytics Cards */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" /> Reward Activity & Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Points Issued */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Points Issued</div>
              <div className="text-2xl font-black text-emerald-600">+{totalEarnedPoints}</div>
              <div className="text-[10px] text-slate-500 font-medium">Earned on delivered orders</div>
            </div>
          </div>

          {/* Card 2: Total Points Redeemed */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points Redeemed</div>
              <div className="text-2xl font-black text-orange-600">-{totalRedeemedPoints}</div>
              <div className="text-[10px] text-slate-500 font-medium">Used during checkout</div>
            </div>
          </div>

          {/* Card 3: Total Monetary Discount */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Value</div>
              <div className="text-2xl font-black text-amber-600">₹{totalMonetaryDiscount.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 font-medium">Total discount credited</div>
            </div>
          </div>

          {/* Card 4: Total Transactions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ledger Entries</div>
              <div className="text-2xl font-black text-slate-900">{transactions.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">Recorded audit transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward Ledger Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" /> Reward Audit Ledger & Activity
            </h3>
            <p className="text-xs text-slate-500">Immutable transaction log for earnings, redemptions, and refunds</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order, customer, branch..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 w-full sm:w-56"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {["ALL", "EARNED", "REDEEMED", "REFUNDED"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    filterType === t
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Monetary Value</th>
                <th className="px-4 py-3 text-right pr-6">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No reward transactions recorded for the selected scope.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx) => {
                  const type = (tx.type || tx.transactionType || "EARNED").toUpperCase();
                  const isEarned = type === "EARNED";
                  const isRedeemed = type === "REDEEMED";
                  const isRefunded = type === "REFUNDED";

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.createdAt || tx.timestamp || Date.now()).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">
                        {tx.orderNumber ? `#${tx.orderNumber}` : "N/A"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        {tx.userId || tx.customerId || "Customer"}
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-semibold">
                        {tx.branchName || "Branch"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isEarned
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : isRedeemed
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}
                        >
                          {type}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-black">
                        <span
                          className={
                            isEarned || (isRefunded && tx.points > 0)
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }
                        >
                          {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        ₹{Number(tx.monetaryValue || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right pr-6 font-bold text-slate-700">
                        {tx.remainingBalance !== undefined ? `${tx.remainingBalance} Pts` : "—"}
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
  );
}
