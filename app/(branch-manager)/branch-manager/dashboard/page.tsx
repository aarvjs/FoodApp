"use client";

import React from "react";
import Link from "next/link";
import { 
  Store, 
  ShoppingBag, 
  Clock, 
  UtensilsCrossed, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Bike,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { revenueService } from "@/services/revenueService";

export default function BranchManagerDashboardPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);

  // STRICTLY SCOPED TO ASSIGNED BRANCH ONLY!
  const assignedBranch = branches.find((b) => b.id === user?.branchId) || branches[0];
  const branchOrders = orders.filter((o) => o.branchId === assignedBranch?.id);

  const metrics = revenueService.calculateMetrics(orders, assignedBranch?.id);
  const pendingOrders = branchOrders.filter((o) => o.status === "PENDING");
  const preparingOrders = branchOrders.filter((o) => o.status === "PREPARING");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-2">
            <Store className="w-3.5 h-3.5" /> Assigned Branch Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{assignedBranch?.name || "Branch Dashboard"}</h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            {assignedBranch?.location?.formattedAddress || "Main Location"} • {assignedBranch?.location?.city}
          </p>
        </div>
        <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/20 text-right">
          <span className="block text-[10px] uppercase font-bold text-amber-200">Branch Status</span>
          <span className="text-sm font-extrabold text-white uppercase tracking-wider">{assignedBranch?.status || "OPEN"}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 h-full flex flex-col justify-between">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Today's Revenue</span>
          <div>
            <p className="text-2xl font-black text-amber-600 truncate">₹{metrics.todayRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Live earnings today</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 h-full flex flex-col justify-between">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Weekly Revenue</span>
          <div>
            <p className="text-2xl font-black text-slate-900 truncate">₹{metrics.weeklyRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Past 7 days total</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 h-full flex flex-col justify-between">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Monthly Revenue</span>
          <div>
            <p className="text-2xl font-black text-slate-900 truncate">₹{metrics.monthlyRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Past 30 days total</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 h-full flex flex-col justify-between">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Total Branch Orders</span>
          <div>
            <p className="text-2xl font-black text-slate-900">{metrics.totalOrdersCount}</p>
            <p className="text-[11px] text-emerald-600 font-bold">{metrics.completedOrdersCount} Delivered</p>
          </div>
        </div>
      </div>

      {/* Action Required Pending Orders */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" /> Incoming Orders ({pendingOrders.length})
            </h2>
            <p className="text-xs text-slate-500">Accept and assign preparation times for incoming branch orders</p>
          </div>
          <Link href="/branch-manager/orders" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs font-medium">
            No pending incoming orders at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map((ord) => (
              <div key={ord.id} className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                  <span className="px-2 py-0.5 bg-amber-200/60 text-amber-900 rounded font-bold text-[10px]">
                    {ord.orderType}
                  </span>
                </div>
                <div className="text-xs text-slate-700">
                  <p className="font-bold">{ord.customerName} ({ord.customerPhone})</p>
                  <p className="text-[11px] text-slate-500">{ord.items?.map(i => `${i.quantity}x ${i.productName}`).join(", ")}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-200/60 text-xs">
                  <span className="font-black text-slate-900">₹{ord.totalAmount}</span>
                  <Link
                    href="/branch-manager/orders"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg shadow text-xs transition-colors"
                  >
                    Accept Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
