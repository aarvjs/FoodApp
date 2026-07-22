"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Restaurant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  Building2,
} from "lucide-react";

export default function RestaurantsPage() {
  const { restaurants } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Restaurant Management
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage multi-brand restaurant network, owners, logos, & banners
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Restaurant</span>
        </button>
      </div>

      {/* Restaurant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((rest) => (
          <div
            key={rest.id}
            className="glass-card rounded-3xl bg-white border border-orange-100/80 overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Banner Image */}
              <div className="h-36 relative overflow-hidden bg-stone-100">
                <img
                  src={rest.banner}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={rest.status === "ACTIVE" ? "success" : "neutral"}>
                    {rest.status}
                  </Badge>
                </div>
              </div>

              {/* Header Info with Logo Overlap */}
              <div className="p-5 pt-0 relative">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md border border-stone-200/60 -mt-8 relative z-10 mb-3 overflow-hidden">
                  <img
                    src={rest.logo}
                    alt={rest.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-stone-900 tracking-tight">
                    {rest.name}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                    <span>{rest.rating}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-stone-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Owner: {rest.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{rest.ownerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{rest.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-5 pt-3 border-t border-stone-100 bg-[#FFFDF8] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Network Revenue
                </span>
                <span className="font-extrabold text-sm text-[#FF6B35]">
                  {formatCurrency(rest.totalRevenue)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRest(rest)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6B35] font-bold text-xs rounded-xl transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Restaurant Modal */}
      <Modal
        isOpen={isAddModalOpen || !!selectedRest}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedRest(null);
        }}
        title={selectedRest ? `Edit ${selectedRest.name}` : "Create New Restaurant"}
        subtitle="Configure brand details, owner contacts, logo, and cover image"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
            setSelectedRest(null);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Restaurant / Brand Title
            </label>
            <input
              type="text"
              defaultValue={selectedRest?.name || ""}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="e.g. Royal Spice Kitchen"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                defaultValue={selectedRest?.ownerName || ""}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Rajesh Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Owner Email
              </label>
              <input
                type="email"
                defaultValue={selectedRest?.ownerEmail || ""}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="owner@brand.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Logo Image URL
              </label>
              <input
                type="url"
                defaultValue={selectedRest?.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                defaultValue={selectedRest?.banner || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedRest(null);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Save Restaurant
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
