"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Branch } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  GitBranch,
  Plus,
  MapPin,
  Clock,
  Navigation,
  User,
  Phone,
  Power,
  Flame,
} from "lucide-react";

export default function BranchesPage() {
  const { branches, updateBranchStatus, updateKitchenStatus, addBranch } =
    useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Branch Operations & Outlets
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage Kanpur, Lucknow, and Delhi branches, opening times, and kitchen load
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="glass-card rounded-3xl bg-white border border-orange-100/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-amber-500/20">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900">
                      {branch.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-medium">
                      {branch.city} Outlet
                    </p>
                  </div>
                </div>

                <Badge variant={branch.status === "OPEN" ? "success" : "danger"}>
                  {branch.status}
                </Badge>
              </div>

              <div className="space-y-2 mt-4 text-xs text-stone-600 font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Manager: {branch.managerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    Hours: {branch.openingTime} - {branch.closingTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#FF6B35] shrink-0" />
                  <span className="font-bold text-stone-800">
                    Delivery Radius: {branch.deliveryRadiusKm} km
                  </span>
                </div>
              </div>
            </div>

            {/* Kitchen Status Controls */}
            <div className="p-3 bg-[#FFFDF8] rounded-2xl border border-orange-100/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-stone-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF6B35]" />
                  <span>Kitchen Status</span>
                </span>
                <Badge
                  variant={
                    branch.kitchenStatus === "OPERATIONAL"
                      ? "success"
                      : branch.kitchenStatus === "HIGH_LOAD"
                      ? "warning"
                      : "danger"
                  }
                >
                  {branch.kitchenStatus.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center gap-1 pt-1">
                <button
                  onClick={() => updateKitchenStatus(branch.id, "OPERATIONAL")}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    branch.kitchenStatus === "OPERATIONAL"
                      ? "bg-emerald-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => updateKitchenStatus(branch.id, "HIGH_LOAD")}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    branch.kitchenStatus === "HIGH_LOAD"
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Rush Hour
                </button>
                <button
                  onClick={() => updateKitchenStatus(branch.id, "OFFLINE")}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    branch.kitchenStatus === "OFFLINE"
                      ? "bg-rose-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Paused
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Outlet Branch"
        subtitle="Expand Food Kingdom presence to a new city or locality"
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
              Branch Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Food Kingdom - Varanasi"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                City
              </label>
              <input
                type="text"
                required
                placeholder="Varanasi"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                defaultValue={8}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Physical Address
            </label>
            <input
              type="text"
              required
              placeholder="Address line with pincode"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Assigned Manager Name
              </label>
              <input
                type="text"
                required
                placeholder="Manager Name"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Branch Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Create Branch
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
