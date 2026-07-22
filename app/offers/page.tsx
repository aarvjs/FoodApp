"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Tag, Plus, Flame, Sparkles } from "lucide-react";

export default function OffersPage() {
  const { offers } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Special Offers & Festival Campaigns
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage festival discounts, combo deal banners, and free delivery promotions
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((off) => (
          <div
            key={off.id}
            className="glass-card rounded-3xl bg-white border border-orange-100/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="h-44 relative bg-stone-100">
              <img
                src={off.banner}
                alt={off.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="primary">{off.type}</Badge>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-extrabold text-stone-900 mb-1">
                {off.title}
              </h3>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                {off.description}
              </p>
            </div>

            <div className="p-4 border-t border-stone-100 bg-[#FFFDF8] flex items-center justify-between">
              <Badge variant="success">{off.status}</Badge>
              <span className="text-xs font-bold text-[#FF6B35]">
                {off.discountPercentage ? `${off.discountPercentage}% Discount` : "Special Deal"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Campaign Offer"
        subtitle="Set up festival deal banners & discount percentages"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Campaign Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Dhamaka Combo"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              required
              placeholder="Offer details and terms..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Banner Image URL
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
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
              Launch Offer
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
