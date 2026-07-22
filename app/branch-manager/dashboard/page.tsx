"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/utils";
import {
  GitBranch,
  ShoppingBag,
  ChefHat,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function BranchManagerDashboardPage() {
  const { branchManagerUser } = useAuthStore();
  const { orders, branches, products } = useAppStore();

  const assignedBranchId = branchManagerUser?.assignedBranchId || "branch-kanpur";
  const assignedBranchName = branchManagerUser?.assignedBranchName || "Kanpur Branch";

  // STRICT BRANCH DATA FILTERING
  const branchOrders = orders.filter((o) => o.branchId === assignedBranchId);
  const branchInfo = branches.find((b) => b.id === assignedBranchId) || branches[0];

  const todayOrdersCount = branchOrders.length;
  const preparingOrdersCount = branchOrders.filter((o) => o.status === "PREPARING").length;
  const readyOrdersCount = branchOrders.filter((o) => o.status === "READY").length;
  const cancelledOrdersCount = branchOrders.filter((o) => o.status === "CANCELLED").length;
  const branchRevenue = branchOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Scoped Branch Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-600 text-white shadow-xl relative overflow-hidden border border-stone-800">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Strict Scoped Branch View: {assignedBranchName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {assignedBranchName} Operations
          </h1>
          <p className="text-xs md:text-sm text-stone-300 font-medium mt-1">
            Managing live line orders, kitchen KDS, and daily sales report for {assignedBranchName}.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <Link
            href="/branch-manager/kitchen"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen View</span>
          </Link>
          <Link
            href="/branch-manager/orders"
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Branch Orders</span>
          </Link>
        </div>
      </div>

      {/* Scoped Branch Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Orders"
          value={todayOrdersCount}
          change="+18% vs yesterday"
          iconName="ShoppingBag"
          subtitle={`${assignedBranchName} only`}
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Preparing Orders"
          value={preparingOrdersCount}
          subtitle="Kitchen line actively cooking"
          iconName="ChefHat"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Ready for Pickup"
          value={readyOrdersCount}
          subtitle="Awaiting rider / counter dispatch"
          iconName="CheckCircle2"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Today's Branch Sales"
          value={formatCurrency(branchRevenue)}
          change="+14.2%"
          iconName="IndianRupee"
          subtitle={`${assignedBranchName} daily total`}
          className="bg-stone-900 border-stone-800 text-white"
        />
      </div>

      {/* Scoped Branch Orders List */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white">
              {assignedBranchName} Active Orders Queue
            </h2>
            <p className="text-xs text-stone-400 font-medium mt-0.5">
              Live orders belonging strictly to {assignedBranchName}
            </p>
          </div>
          <Badge variant="warning">{branchOrders.length} Orders Scoped</Badge>
        </div>

        <div className="divide-y divide-stone-800">
          {branchOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-500">
              No orders placed at this branch yet today.
            </p>
          ) : (
            branchOrders.map((ord) => (
              <div
                key={ord.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-stone-800/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {ord.orderNumber.split("-")[1]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {ord.customerName}
                      </span>
                      <Badge
                        variant={
                          ord.status === "DELIVERED"
                            ? "success"
                            : ord.status === "PREPARING"
                            ? "warning"
                            : "info"
                        }
                      >
                        {ord.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                      {ord.items.length} items ({ord.orderType}) • OTP: {ord.otp || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-xs text-amber-400 block">
                    {formatCurrency(ord.totalAmount)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    {ord.paymentStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
