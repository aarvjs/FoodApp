"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/shared/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Store,
  GitBranch,
  UserCheck,
  Building2,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { restaurants, branches, orders } = useAppStore();
  const { branchManagerAccounts, ownerAccounts } = useAuthStore();

  const totalNetworkRevenue = restaurants.reduce((acc, r) => acc + r.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-[#FF6B35] text-white shadow-xl relative overflow-hidden border border-stone-800">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-2 text-orange-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Headquarters</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Network Operations Center
          </h1>
          <p className="text-xs md:text-sm text-stone-300 font-medium mt-1">
            Global management of restaurants, branches, owner accounts, and manager provisioning.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <Link
            href="/admin/branch-managers"
            className="px-4 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Provision Managers</span>
          </Link>
        </div>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Network Revenue"
          value={formatCurrency(totalNetworkRevenue)}
          change="+32.4% YoY"
          iconName="IndianRupee"
          subtitle="All brands combined"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Registered Brands"
          value={restaurants.length}
          change="+2 new"
          iconName="Store"
          subtitle="Active restaurant portfolios"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Operational Outlets"
          value={branches.length}
          change="+3 cities"
          iconName="GitBranch"
          subtitle="Kanpur, Lucknow, Delhi"
          className="bg-stone-900 border-stone-800 text-white"
        />
        <StatCard
          title="Branch Managers"
          value={branchManagerAccounts.length}
          change="Provisioned"
          iconName="UserCheck"
          subtitle="Scoped credentials active"
          className="bg-stone-900 border-stone-800 text-white"
        />
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/branch-managers"
          className="p-6 rounded-3xl bg-stone-900 border border-stone-800 hover:border-[#FF6B35] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-[#FF6B35] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-stone-500 group-hover:text-[#FF6B35] transition-colors" />
          </div>
          <h3 className="font-extrabold text-white text-base">
            Branch Managers Provisioning
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Create manager emails, passwords, and assign branch access scopes.
          </p>
        </Link>

        <Link
          href="/admin/restaurants"
          className="p-6 rounded-3xl bg-stone-900 border border-stone-800 hover:border-[#FF6B35] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-stone-500 group-hover:text-[#FF6B35] transition-colors" />
          </div>
          <h3 className="font-extrabold text-white text-base">
            Restaurant Portfolios
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Create & manage brands like Food Kingdom, Spice Route, Urban Bistro.
          </p>
        </Link>

        <Link
          href="/admin/owners"
          className="p-6 rounded-3xl bg-stone-900 border border-stone-800 hover:border-[#FF6B35] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-stone-500 group-hover:text-[#FF6B35] transition-colors" />
          </div>
          <h3 className="font-extrabold text-white text-base">
            Owner Accounts
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Manage owner profiles, login access, and business credentials.
          </p>
        </Link>
      </div>
    </div>
  );
}
