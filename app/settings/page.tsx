"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import {
  Settings,
  Store,
  GitBranch,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "branch" | "notifications" | "permissions">("general");

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#FF6B35]" />
            <span>System Settings & Governance</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Configure restaurant rules, notification webhooks, and role permission policies
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-orange-100/80 pb-2 overflow-x-auto">
        {[
          { key: "general", label: "Restaurant Config", icon: Store },
          { key: "branch", label: "Branch Rules", icon: GitBranch },
          { key: "notifications", label: "Alert Notifications", icon: Bell },
          { key: "permissions", label: "Role Permissions Matrix", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-stone-600 border border-stone-200/80 hover:bg-orange-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "general" && (
        <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 max-w-2xl space-y-4">
          <h2 className="text-base font-extrabold text-stone-900">
            Brand Identity Settings
          </h2>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Main Brand Title
            </label>
            <input
              type="text"
              defaultValue="Food Kingdom"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Support Helpline Number
            </label>
            <input
              type="text"
              defaultValue="+91 1800 456 7890"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              GST / Tax Identification Number (GSTIN)
            </label>
            <input
              type="text"
              defaultValue="09AAACF1234H1Z5"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            />
          </div>
          <button className="px-4 py-2 bg-[#FF6B35] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20">
            Save Brand Settings
          </button>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 space-y-4">
          <h2 className="text-base font-extrabold text-stone-900">
            Role Permission Policy Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FFFDF8] border-b border-stone-100 text-stone-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Feature Module</th>
                  <th className="py-3 px-4">Super Admin</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Branch Mgr</th>
                  <th className="py-3 px-4">Kitchen Staff</th>
                  <th className="py-3 px-4">Delivery Boy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {[
                  "Manage Restaurants",
                  "Create Branches",
                  "Manage Orders & Dispatch",
                  "Kitchen KDS Access",
                  "Delivery OTP Verify",
                  "View Financial Analytics",
                  "Edit Staff Roles",
                ].map((feature, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-bold text-stone-900">{feature}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">✓ Brand</td>
                    <td className="py-3 px-4 text-amber-600 font-bold">✓ Branch</td>
                    <td className="py-3 px-4 text-stone-400">Limited</td>
                    <td className="py-3 px-4 text-stone-400">Limited</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
