"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Award, ArrowUpRight } from "lucide-react";

const MONTHLY_SALES_DATA = [
  { month: "Jan", revenue: 1450000, orders: 1200 },
  { month: "Feb", revenue: 1680000, orders: 1390 },
  { month: "Mar", revenue: 1920000, orders: 1540 },
  { month: "Apr", revenue: 1850000, orders: 1480 },
  { month: "May", revenue: 2150000, orders: 1720 },
  { month: "Jun", revenue: 2450000, orders: 1980 },
];

const BRANCH_COMPARISON_DATA = [
  { city: "Kanpur", revenue: 840000, orders: 640 },
  { city: "Lucknow", revenue: 980000, orders: 790 },
  { city: "Delhi", revenue: 1250000, orders: 990 },
];

const TOP_PRODUCTS_DATA = [
  { name: "Chicken Biryani", sales: 840, color: "#FF6B35" },
  { name: "Truffle Pizza", sales: 620, color: "#FFA726" },
  { name: "Royal Cheese Burger", sales: 540, color: "#22C55E" },
  { name: "Paneer Tikka Roll", sales: 480, color: "#3B82F6" },
  { name: "Lava Cake", sales: 390, color: "#EC4899" },
];

export default function AnalyticsPage() {
  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#FF6B35]" />
            <span>Executive Business Analytics</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Revenue trends, branch sales comparisons, & top product velocity metrics
          </p>
        </div>

        <Badge variant="primary" className="px-3 py-1.5 text-xs">
          <span>Live FY2026 Reporting</span>
        </Badge>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="YTD Total Sales"
          value={formatCurrency(11490000)}
          change="+28.4% YoY"
          iconName="IndianRupee"
          subtitle="Target 88% completed"
        />
        <StatCard
          title="Average Order Value"
          value="₹482"
          change="+6.2%"
          iconName="TrendingUp"
          subtitle="Basket size up"
        />
        <StatCard
          title="Gross Margin"
          value="68.5%"
          change="+3.1%"
          iconName="PieChart"
          subtitle="Food cost 31.5%"
        />
        <StatCard
          title="Repeat Customer Ratio"
          value="64.2%"
          change="+11.8%"
          iconName="Users"
          subtitle="Loyalty program active"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl bg-white border border-orange-100/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Monthly Revenue Trajectory (6 Months)
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Gross sales volume in INR
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SALES_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E9DD" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#7C756B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#7C756B" }} tickFormatter={(val) => `₹${val / 100000}L`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #FFE4D6",
                    boxShadow: "0 10px 25px -5px rgba(255,107,53,0.15)",
                  }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Revenue Comparison Bar Chart */}
        <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80">
          <h2 className="text-base font-bold text-stone-900 mb-1">
            Branch Revenue Comparison
          </h2>
          <p className="text-xs text-stone-500 font-medium mb-6">
            Kanpur vs Lucknow vs Delhi
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BRANCH_COMPARISON_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E9DD" />
                <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#7C756B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#7C756B" }} tickFormatter={(val) => `₹${val / 100000}L`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #FFE4D6",
                  }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, "Sales"]}
                />
                <Bar dataKey="revenue" fill="#FFA726" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Products Velocity */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80">
        <h2 className="text-base font-bold text-stone-900 mb-4">
          Top 5 Dish Sales Velocity (Units Sold)
        </h2>

        <div className="space-y-4">
          {TOP_PRODUCTS_DATA.map((prod) => (
            <div key={prod.name} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>{prod.name}</span>
                <span className="text-[#FF6B35]">{prod.sales} orders</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(prod.sales / 1000) * 100}%`,
                    backgroundColor: prod.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
