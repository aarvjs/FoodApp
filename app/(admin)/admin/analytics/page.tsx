"use client";

import React from "react";
import { BarChart3, PieChart, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function SuperAdminAnalyticsPage() {
  const orders = useStore((state) => state.orders);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" /> Global Network Analytics
        </h1>
        <p className="text-xs text-slate-500">System-wide performance indicators, customer retention & top items</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Completed Orders</span>
          <div>
            <p className="text-2xl font-black text-slate-900">{orders.length}</p>
            <span className="text-xs text-emerald-600 font-semibold">100% fulfill rate</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Menu Items</span>
          <div>
            <p className="text-2xl font-black text-slate-900">{products.length}</p>
            <span className="text-xs text-slate-500 font-medium">Across all categories</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2 h-full flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Registered Customers</span>
          <div>
            <p className="text-2xl font-black text-slate-900">{customers.length}</p>
            <span className="text-xs text-emerald-600 font-semibold">+18% repeat orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
