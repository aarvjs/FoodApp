"use client";

import React from "react";
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Utensils, Clock } from "lucide-react";
import { OrderModel } from "@/models/order";
import { MenuItemModel } from "@/models/menuItem";
import { revenueService } from "@/services/revenueService";

interface AnalyticsModuleProps {
  orders: OrderModel[];
  menuItems: MenuItemModel[];
}

export function AnalyticsModule({ orders, menuItems }: AnalyticsModuleProps) {
  const metrics = revenueService.calculateMetrics(orders as any);
  const avgOrderValue = orders.length > 0 ? Math.round(metrics.totalRevenue / orders.length) : 0;

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" /> Restaurant Analytics & Sales Performance
        </h2>
        <p className="text-xs text-slate-500">Visual performance breakdowns, top revenue drivers & order stats</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Total Lifetime Sales</span>
          <p className="text-2xl font-black text-emerald-600">₹{metrics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Orders Processed</span>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Average Order Value</span>
          <p className="text-2xl font-black text-slate-900">₹{avgOrderValue}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Today's Revenue</span>
          <p className="text-2xl font-black text-emerald-700">₹{metrics.todayRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Popular Items & Peak Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" /> Top Selling Food Items
          </h3>
          <div className="space-y-2">
            {menuItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl font-medium">
                <span>{item.name}</span>
                <span className="font-bold text-emerald-700">₹{item.offerPrice || item.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" /> Peak Order Hours
          </h3>
          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between">
              <span>01:00 PM - 03:00 PM (Lunch)</span>
              <strong className="text-slate-900">38% Orders</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between">
              <span>08:00 PM - 10:30 PM (Dinner)</span>
              <strong className="text-slate-900">52% Orders</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
