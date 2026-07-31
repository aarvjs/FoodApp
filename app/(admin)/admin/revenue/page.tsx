"use client";

import React from "react";
import { IndianRupee, TrendingUp, Calendar, CheckCircle2, Clock, XCircle, ArrowUpRight, BarChart2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { revenueService } from "@/services/revenueService";

export default function SuperAdminRevenuePage() {
  const orders = useStore((state) => state.orders);
  const branches = useStore((state) => state.branches);

  const metrics = revenueService.calculateMetrics(orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-emerald-600" /> Revenue & Financial Analytics
        </h1>
        <p className="text-xs text-slate-500">Super Admin overall financial earnings breakdown across all branches</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Today's Revenue</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">₹{metrics.todayRevenue.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-500">Live earnings for today</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Weekly Revenue</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">₹{metrics.weeklyRevenue.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-500">Past 7 days accumulated</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Monthly Revenue</span>
            <BarChart2 className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">₹{metrics.monthlyRevenue.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-500">Past 30 days total</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Lifetime</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-emerald-600">₹{metrics.totalRevenue.toLocaleString()}</h2>
          <p className="text-[11px] text-slate-500">All orders overall</p>
        </div>
      </div>

      {/* Order Status Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{metrics.totalOrdersCount}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Completed</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{metrics.completedOrdersCount}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Pending</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{metrics.pendingOrdersCount}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-rose-600 uppercase">Cancelled / Rejected</span>
          <p className="text-xl font-bold text-rose-700 mt-1">{metrics.cancelledOrdersCount + metrics.rejectedOrdersCount}</p>
        </div>
      </div>

      {/* Branch Financial Breakdown Table */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Branch Earnings Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {branches.map((b) => {
            const bMetrics = revenueService.calculateMetrics(orders, b.id);
            return (
              <div key={b.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                  <span className="text-xs font-black text-emerald-600">₹{bMetrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <div>Today: <strong className="text-slate-900">₹{bMetrics.todayRevenue}</strong></div>
                  <div>Orders: <strong className="text-slate-900">{bMetrics.totalOrdersCount}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
