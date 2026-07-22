"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  Store,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const REVENUE_DATA = [
  { day: "Mon", revenue: 42000, orders: 48 },
  { day: "Tue", revenue: 58000, orders: 62 },
  { day: "Wed", revenue: 51000, orders: 55 },
  { day: "Thu", revenue: 69000, orders: 74 },
  { day: "Fri", revenue: 95000, orders: 110 },
  { day: "Sat", revenue: 124000, orders: 145 },
  { day: "Sun", revenue: 112000, orders: 130 },
];

const CATEGORY_PIE_DATA = [
  { name: "Biryani & Bowls", value: 40, color: "#FF6B35" },
  { name: "Pizzas & Pastas", value: 28, color: "#FFA726" },
  { name: "Burgers & Sandwiches", value: 18, color: "#22C55E" },
  { name: "Starters & Desserts", value: 14, color: "#3B82F6" },
];

export default function DashboardPage() {
  const { currentRole, orders, branches, products, selectedBranchId } = useAppStore();

  const activeBranchName =
    selectedBranchId === "ALL"
      ? "All Outlets (Kanpur, Lucknow, Delhi)"
      : branches.find((b) => b.id === selectedBranchId)?.name || "Selected Branch";

  const totalRevenue = 205600;
  const todaySales = 42500;
  const totalOrders = orders.length;
  const preparingOrdersCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyOrdersCount = orders.filter((o) => o.status === "READY").length;
  const cancelledOrdersCount = orders.filter((o) => o.status === "CANCELLED").length;

  return (
    <AppShell>
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-2">
            <span>✨ Real-time Operations Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentRole.replace("_", " ")}!
          </h1>
          <p className="text-xs md:text-sm opacity-90 font-medium mt-1">
            Monitoring {activeBranchName} live activity and metrics.
          </p>
        </div>

        <div className="z-10 flex items-center gap-2">
          <Link
            href="/orders"
            className="px-4 py-2.5 rounded-xl bg-white text-[#FF6B35] hover:bg-orange-50 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <span>Live Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/kitchen"
            className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-bold text-xs transition-colors flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen View</span>
          </Link>
        </div>
      </div>

      {/* Widgets Grid based on Role */}
      {currentRole === "BRANCH_MANAGER" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Today's Orders"
            value={48}
            change="+18% vs yesterday"
            iconName="ShoppingBag"
          />
          <StatCard
            title="Preparing Orders"
            value={preparingOrdersCount}
            subtitle="Kanpur Main Kitchen"
            iconName="ChefHat"
          />
          <StatCard
            title="Ready for Pickup"
            value={readyOrdersCount}
            subtitle="Dispatched to counter"
            iconName="CheckCircle2"
          />
          <StatCard
            title="Cancelled Orders"
            value={cancelledOrdersCount}
            isPositive={false}
            change="-2% lower"
            iconName="XCircle"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change="+24.5%"
            iconName="IndianRupee"
            subtitle="Month to date"
          />
          <StatCard
            title="Today's Sales"
            value={formatCurrency(todaySales)}
            change="+12.8%"
            iconName="TrendingUp"
            subtitle="Across 3 branches"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders}
            change="+15.2%"
            iconName="ShoppingBag"
            subtitle="98.2% fulfillment rate"
          />
          <StatCard
            title="Active Customers"
            value="1,420"
            change="+8.4%"
            iconName="Users"
            subtitle="Repeat customer rate 64%"
          />
        </div>
      )}

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl bg-white border border-orange-100/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Weekly Revenue & Order Velocity
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Sales numbers for Kanpur, Lucknow, and Delhi outlets
              </p>
            </div>
            <Badge variant="primary">Updated Live</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E9DD" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#7C756B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#7C756B" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid #FFE4D6",
                    boxShadow: "0 10px 25px -5px rgba(255,107,53,0.15)",
                  }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Categories Breakdown */}
        <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 mb-1">
              Sales by Category
            </h2>
            <p className="text-xs text-stone-500 font-medium mb-4">
              Top performing food categories this month
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_PIE_DATA}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {CATEGORY_PIE_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-stone-700">{cat.name}</span>
                </div>
                <span className="font-bold text-stone-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Performance & Recent Orders split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Performance Cards */}
        <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              Branch Performance
            </h2>
            <Link href="/branches" className="text-xs text-[#FF6B35] font-bold hover:underline">
              View All
            </Link>
          </div>

          {branches.map((branch) => (
            <div
              key={branch.id}
              className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between hover:border-orange-200 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">{branch.city}</span>
                  <Badge variant={branch.kitchenStatus === "OPERATIONAL" ? "success" : "warning"}>
                    {branch.kitchenStatus.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-stone-500 font-medium mt-1">
                  Manager: {branch.managerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-[#FF6B35]">
                  {formatCurrency(branch.todayRevenue)}
                </p>
                <p className="text-[11px] text-stone-400 font-semibold">
                  {branch.todayOrdersCount} orders today
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl bg-white border border-orange-100/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Recent Orders Queue
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Live stream of incoming and active orders
              </p>
            </div>
            <Link href="/orders" className="text-xs text-[#FF6B35] font-bold hover:underline flex items-center gap-1">
              <span>Manage Orders</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-orange-50/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B35] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {ord.orderNumber.split("-")[1]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{ord.customerName}</span>
                      <Badge
                        variant={
                          ord.status === "DELIVERED"
                            ? "success"
                            : ord.status === "PREPARING"
                            ? "warning"
                            : ord.status === "READY"
                            ? "info"
                            : "neutral"
                        }
                      >
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                      {ord.branchName} Branch • {ord.items.length} items ({ord.orderType})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-xs text-stone-900 block">
                    {formatCurrency(ord.totalAmount)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">
                    {ord.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
