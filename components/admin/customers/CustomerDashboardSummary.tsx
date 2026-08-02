"use client";

import React from "react";
import { Users, UserCheck, Wallet, ShoppingBag, TrendingUp, UserPlus } from "lucide-react";

interface CustomerDashboardSummaryProps {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    totalRevenue: number;
    totalOrders: number;
    avgRevenuePerCustomer: number;
    newCustomersThisMonth: number;
  };
}

export function CustomerDashboardSummary({ summary }: CustomerDashboardSummaryProps) {
  const cards = [
    {
      title: "Total Customers",
      value: summary.totalCustomers.toLocaleString(),
      subtitle: "Registered & Guest users",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      badge: "+12% this month"
    },
    {
      title: "Active Customers",
      value: summary.activeCustomers.toLocaleString(),
      subtitle: `${summary.totalCustomers > 0 ? Math.round((summary.activeCustomers / summary.totalCustomers) * 100) : 0}% active engagement`,
      icon: UserCheck,
      color: "from-blue-500 to-indigo-600",
      lightBg: "bg-blue-50 text-blue-600 border-blue-100",
      badge: "Active users"
    },
    {
      title: "Total Customer Revenue",
      value: `₹${summary.totalRevenue.toLocaleString()}`,
      subtitle: "Lifetime gross earnings",
      icon: Wallet,
      color: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50 text-amber-600 border-amber-100",
      badge: "Gross Revenue"
    },
    {
      title: "Total Orders Placed",
      value: summary.totalOrders.toLocaleString(),
      subtitle: "Across all branches",
      icon: ShoppingBag,
      color: "from-purple-500 to-violet-600",
      lightBg: "bg-purple-50 text-purple-600 border-purple-100",
      badge: "Completed & Active"
    },
    {
      title: "Avg Revenue / Customer",
      value: `₹${summary.avgRevenuePerCustomer.toLocaleString()}`,
      subtitle: "Lifetime value per user",
      icon: TrendingUp,
      color: "from-rose-500 to-pink-600",
      lightBg: "bg-rose-50 text-rose-600 border-rose-100",
      badge: "ARPU"
    },
    {
      title: "New Customers (This Month)",
      value: summary.newCustomersThisMonth.toLocaleString(),
      subtitle: "Joined in current month",
      icon: UserPlus,
      color: "from-cyan-500 to-sky-600",
      lightBg: "bg-cyan-50 text-cyan-600 border-cyan-100",
      badge: "New Growth"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.lightBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {card.badge}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">{card.title}</div>
              <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{card.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
