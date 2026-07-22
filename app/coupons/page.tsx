"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Coupon } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Ticket, Plus, Copy, Check, Calendar, Power } from "lucide-react";

export default function CouponsPage() {
  const { coupons, toggleCouponStatus, addCoupon, branches } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Coupons & Promo Codes
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Create discount vouchers, minimum order thresholds, and branch-scoped promos
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="glass-card rounded-3xl bg-white border border-orange-100/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={c.status === "ACTIVE" ? "success" : "neutral"}>
                  {c.status}
                </Badge>
                <span className="text-[11px] font-semibold text-stone-400">
                  Used {c.usageCount} times
                </span>
              </div>

              <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 flex items-center justify-between mb-3">
                <span className="font-extrabold text-base tracking-widest text-[#FF6B35]">
                  {c.code}
                </span>
                <button
                  onClick={() => copyToClipboard(c.code)}
                  className="p-1.5 rounded-lg bg-white text-stone-600 hover:text-[#FF6B35] shadow-xs text-xs font-bold flex items-center gap-1"
                >
                  {copiedCode === c.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <h3 className="font-extrabold text-stone-900 text-sm">{c.title}</h3>

              <div className="mt-3 space-y-1 text-xs text-stone-500 font-medium">
                <p>
                  Discount:{" "}
                  <strong className="text-stone-900">
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} FLAT`}
                  </strong>
                </p>
                <p>
                  Min Order Value:{" "}
                  <strong className="text-stone-900">
                    {formatCurrency(c.minOrderValue)}
                  </strong>
                </p>
                <p className="flex items-center gap-1 text-stone-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Valid till {c.validTill}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700">
                Scope: {c.branchScope === "ALL" ? "All Outlets" : c.branchScope}
              </span>
              <button
                onClick={() => toggleCouponStatus(c.id)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Promo Coupon"
        subtitle="Set discount rules, coupon code, and minimum purchase"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                required
                placeholder="FEAST20"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Discount Type
              </label>
              <select className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Coupon Headline Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 20% Off On Orders Above ₹499"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                required
                placeholder="20"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                required
                placeholder="399"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
