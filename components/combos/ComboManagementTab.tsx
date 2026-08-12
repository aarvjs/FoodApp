"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Search, Package, Sparkles, ChevronRight, Layers } from "lucide-react";
import { Combo } from "@/types";
import { comboService } from "@/services/comboService";
import { ComboModal } from "./ComboModal";
import { ComboDetailPage } from "./ComboDetailPage";

interface ComboManagementTabProps {
  combos: Combo[];
  onAddCombo: (data: Partial<Combo> & { imageFile?: File | string }) => Promise<Combo> | Promise<void>;
  onUpdateCombo: (id: string, updated: Partial<Combo> & { imageFile?: File | string }) => Promise<void>;
  onDeleteCombo: (id: string) => Promise<void>;
  onToggleAvailability?: (id: string, isAvailable: boolean) => Promise<void>;
  restaurantId?: string;
  branchId?: string;
  branchIds?: string[];
  isBranchManager?: boolean;
}

export const ComboManagementTab: React.FC<ComboManagementTabProps> = ({
  combos,
  onAddCombo,
  onUpdateCombo,
  onDeleteCombo,
  onToggleAvailability,
  restaurantId = "",
  branchId,
  branchIds,
  isBranchManager = false
}) => {
  const router = useRouter();
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // In-page fallback if used without direct URL navigation
  if (selectedCombo) {
    return (
      <ComboDetailPage
        combo={selectedCombo}
        onBack={() => setSelectedCombo(null)}
        restaurantId={restaurantId || selectedCombo.restaurantId}
        branchId={branchId}
        branchIds={branchIds}
      />
    );
  }

  const filteredCombos = combos.filter((c) => {
    return (
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleOpenCreateModal = () => {
    setEditingCombo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, combo: Combo) => {
    e.stopPropagation();
    setEditingCombo(combo);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, combo: Combo) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete combo "${combo.name}"?`)) {
      await onDeleteCombo(combo.id);
    }
  };

  const handleToggleActive = async (e: React.MouseEvent, combo: Combo) => {
    e.stopPropagation();
    const currentActive = combo.isActive ?? combo.isAvailable ?? true;
    const nextState = !currentActive;
    try {
      if (onToggleAvailability) {
        await onToggleAvailability(combo.id, nextState);
      } else {
        await comboService.toggleAvailability(combo.id, nextState);
      }
    } catch (err) {
      console.error("Failed to toggle combo status:", err);
    }
  };

  const handleCardClick = (combo: Combo) => {
    const targetRestId = restaurantId || combo.restaurantId;
    if (isBranchManager) {
      router.push(`/branch-manager/combos/${combo.id}`);
    } else if (targetRestId) {
      router.push(`/admin/restaurants/${targetRestId}/combos/${combo.id}`);
    } else {
      setSelectedCombo(combo);
    }
  };

  const handleSave = async (data: Partial<Combo> & { imageFile?: File | string }) => {
    if (editingCombo) {
      await onUpdateCombo(editingCombo.id, data);
    } else {
      await onAddCombo({
        ...data,
        restaurantId: restaurantId || data.restaurantId,
        branchId: branchId || data.branchId,
        branchIds: branchIds || data.branchIds
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search combos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
          />
        </div>

        {/* Add Combo Button */}
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Combo</span>
        </button>
      </div>

      {/* Combos Grid */}
      {filteredCombos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Combos Configured</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Create combo categories (e.g. "Buy 1 Get 1 Free", "Super Saving Combo", "Pizza Mania") and click any combo to add items specifically for it.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Combo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCombos.map((combo) => {
            const isComboActive = combo.isActive ?? combo.isAvailable ?? true;

            return (
              <div
                key={combo.id}
                onClick={() => handleCardClick(combo)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer select-none"
              >
                {/* 1. Image banner (Clickable) */}
                <div
                  onClick={() => handleCardClick(combo)}
                  className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={combo.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />
                  {/* Interactive Active / Inactive Toggle Button Overlay */}
                  <div
                    onClick={(e) => handleToggleActive(e, combo)}
                    className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md backdrop-blur-md cursor-pointer transition-all border ${
                      isComboActive
                        ? "bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/40"
                        : "bg-slate-900/85 hover:bg-slate-900 text-slate-200 border-slate-700/50"
                    }`}
                    title={`Click to turn ${isComboActive ? "OFF (INACTIVE)" : "ON (ACTIVE)"}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {isComboActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <div
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                        isComboActive ? "bg-emerald-400" : "bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          isComboActive ? "translate-x-3.5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Card details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div
                    onClick={() => handleCardClick(combo)}
                    className="cursor-pointer"
                  >
                    {/* Combo Name Clickable */}
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors flex items-center justify-between">
                      <span>{combo.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </h3>
                    {combo.description ? (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {combo.description}
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-600 font-semibold mt-1">
                        Click to manage items in this combo
                      </p>
                    )}
                  </div>

                  {/* Active / Inactive Toggle Control Row */}
                  <div
                    onClick={(e) => handleToggleActive(e, combo)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-slate-700">
                      Status:{" "}
                      <span className={isComboActive ? "text-emerald-600 font-extrabold" : "text-slate-500 font-extrabold"}>
                        {isComboActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-slate-500">
                        {isComboActive ? "ON" : "OFF"}
                      </span>
                      <button
                        type="button"
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isComboActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            isComboActive ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* 3. Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span
                      onClick={() => handleCardClick(combo)}
                      className="text-[11px] font-bold text-slate-500 group-hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      Manage Items
                    </span>

                    {/* Edit & Delete Buttons (Isolated with stopPropagation) */}
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(e, combo)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, combo)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Combo Modal */}
      {isModalOpen && (
        <ComboModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          comboToEdit={editingCombo}
        />
      )}
    </div>
  );
};
