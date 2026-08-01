"use client";

import React from "react";
import Link from "next/link";
import { 
  Store, 
  GitFork, 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Flame 
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { analyticsService } from "@/services/analyticsService";

export default function AdminDashboardPage() {
  const restaurants = useStore((state) => state.restaurants);
  const branches = useStore((state) => state.branches);
  const orders = useStore((state) => state.orders);
  const products = useStore((state) => state.products);

  const metrics = analyticsService.computeDashboardMetrics(orders, products);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Control Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Real-Time Cloud Firestore Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Live metric tracking across all restaurants, branches, orders, and sales figures.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/restaurants"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Add Restaurant
          </Link>
          <Link
            href="/admin/branches"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <GitFork className="w-4 h-4" /> Add Branch
          </Link>
        </div>
      </div>

      {/* Metric Cards - Dynamic from Firestore */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{metrics.totalOrders}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Lifetime orders</p>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{metrics.todayOrders}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Placed today</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 truncate">₹{metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-amber-600 font-bold">Earned revenue</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{metrics.pendingOrders}</p>
            <p className="text-[10px] text-orange-600 font-bold">In progress</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{metrics.completedOrders}</p>
            <p className="text-[10px] text-teal-600 font-bold">Delivered & Done</p>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cancelled</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{metrics.cancelledOrders}</p>
            <p className="text-[10px] text-rose-600 font-bold">Cancelled orders</p>
          </div>
        </div>
      </div>

      {/* Main Row: Top Selling Items & Branch List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Top Selling Menu Items
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Firestore</span>
          </div>

          {metrics.topSellingItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No sales data recorded yet. Place orders to view top selling items.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.topSellingItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                      #{i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.salesCount} sold</span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">₹{item.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Branches Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Network Branches</h2>
              <p className="text-xs text-slate-500">Real-time status of all active branches in Firestore</p>
            </div>
            <Link href="/admin/branches" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Manage All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {branches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No branches registered yet. Add branches in Super Admin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="px-3 py-2.5">Branch Name</th>
                    <th className="px-3 py-2.5">City & State</th>
                    <th className="px-3 py-2.5">Manager</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {branches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2.5 font-bold text-slate-900">{b.name || b.branchName}</td>
                      <td className="px-3 py-2.5 text-slate-600">{b.location?.city || "N/A"}, {b.location?.state || ""}</td>
                      <td className="px-3 py-2.5 text-slate-800">{b.managerName || "Unassigned"}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {b.status || "OPEN"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
