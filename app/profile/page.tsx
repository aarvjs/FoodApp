"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { User, Building2, Lock, Mail, Phone, ShieldCheck, Check } from "lucide-react";

export default function ProfilePage() {
  const { currentRole } = useAppStore();
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <User className="w-7 h-7 text-[#FF6B35]" />
            <span>Owner & Business Profile</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage executive profile info, company tax registration, and security credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Summary Card */}
        <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 text-center flex flex-col items-center justify-center space-y-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            alt="Profile Avatar"
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-orange-200 shadow-md"
          />

          <div>
            <h2 className="text-lg font-extrabold text-stone-900">
              Vikram Malhotra
            </h2>
            <p className="text-xs text-stone-400 font-medium mt-0.5">
              Super Admin & Enterprise Owner
            </p>
            <div className="mt-2">
              <Badge variant="primary">{currentRole.replace("_", " ")}</Badge>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600 font-medium text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-stone-400" />
              <span>admin@foodkingdom.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>Food Kingdom HQ India</span>
            </div>
          </div>
        </div>

        {/* Right Forms Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business & Corporate Details */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 space-y-4">
            <h3 className="text-base font-extrabold text-stone-900">
              Company & Corporate Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Registered Legal Name
                </label>
                <input
                  type="text"
                  defaultValue="Food Kingdom Foods & Hospitality Pvt Ltd"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  FSSAI License No.
                </label>
                <input
                  type="text"
                  defaultValue="10021051000845"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Corporate HQ Address
              </label>
              <input
                type="text"
                defaultValue="112, Swaroop Nagar, Opposite Moti Jheel, Kanpur - 208002"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-6 rounded-3xl bg-white border border-orange-100/80 space-y-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Change Account Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    defaultValue="••••••••"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              </div>

              {passwordSaved && (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Password updated successfully!</span>
                </p>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
