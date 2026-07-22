"use client";

import React from "react";
import { Badge } from "@/components/shared/Badge";
import { StatCard } from "@/components/shared/StatCard";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAppStore } from "@/lib/store/useAppStore";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, MapPin, Calendar, FileText } from "lucide-react";

export default function BranchManagerReportsPage() {
  const { branchManagerUser } = useAuthStore();
  const { orders } = useAppStore();

  const assignedBranchId = branchManagerUser?.assignedBranchId || "branch-kanpur";
  const assignedBranchName = branchManagerUser?.assignedBranchName || "Kanpur Branch";

  const branchOrders = orders.filter((o) => o.branchId === assignedBranchId);
  const totalRevenue = branchOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            <span>{assignedBranchName} Sales & Audit Reports</span>
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Scoped branch financial audit, daily order fulfilling velocity, & revenue statements
          </p>
        </div>

        <Badge variant="warning">{assignedBranchName} Scoped Report</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Daily Gross Sales"
          value={formatCurrency(totalRevenue)}
          change="+12.4%"
          iconName="IndianRupee"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Fulfill Rate"
          value="98.5%"
          change="+1.2%"
          iconName="CheckCircle2"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Avg Order Value"
          value="₹450"
          change="+4.0%"
          iconName="TrendingUp"
          className="bg-stone-900 border-stone-800 text-white"
        />
      </div>
    </div>
  );
}
