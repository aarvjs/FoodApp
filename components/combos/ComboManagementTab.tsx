"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Utensils,
  Search,
  IndianRupee,
  ChevronRight
} from "lucide-react";
import { Combo, Product } from "@/types";
import { ComboModal } from "./ComboModal";

interface ComboManagementTabProps {
  combos: Combo[];
  products: Product[];
  onAddCombo: (data: Partial<Combo> & { imageFile?: File | string }) => Promise<Combo> | Promise<void>;
  onUpdateCombo: (id: string, updated: Partial<Combo> & { imageFile?: File | string }) => Promise<void>;
  onDeleteCombo: (id: string) => Promise<void>;
  onToggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
}

export const ComboManagementTab: React.FC<ComboManagementTabProps> = ({
  combos,
  products,
  onAddCombo,
  onUpdateCombo,
  onDeleteCombo,
  onToggleAvailability
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSlot, setFilterSlot] = useState("ALL");

  const filteredCombos = combos.filter((c) => {
    const matchSearch = searchQuery === "" || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSlot = filterSlot === "ALL" || c.availabilitySlot === filterSlot;
    return matchSearch && matchSlot;
  });

  const handleOpenCreateModal = () => {
    setEditingCombo(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (combo: Combo) => {
    setEditingCombo(combo);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Combo> & { imageFile?: File | string }) => {
    if (editingCombo) {
      await onUpdateCombo(editingCombo.id, data);
    } else {
      await onAddCombo(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
            />
          </div>

          <select
            value={filterSlot}
            onChange={(e) => setFilterSlot(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-700 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Hours</option>
            <option value="FULL_DAY">Full Day</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Combo</span>
        </button>
      </div>

      {/* Combos Grid */}
      {filteredCombos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Combos Configured</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Create combo meals bundling burgers, drinks, fries, and customized options with manual pricing control.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg shadow hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create First Combo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCombos.map((combo) => (
            <div
              key={combo.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
            >
              {/* Image & Badges Banner */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={combo.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80"}
                  alt={combo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1 ${
                      combo.isAvailable
                        ? "bg-emerald-500/90 text-white"
                        : "bg-red-500/90 text-white"
                    }`}
                  >
                    {combo.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {combo.isAvailable ? "Available" : "Unavailable"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
                    {combo.availabilitySlot || "FULL_DAY"}
                  </span>
                </div>

                {/* Price Display */}
                <div className="absolute bottom-3 right-3 bg-white/95 text-slate-900 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-sm border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Base Price</span>
                  <span className="text-lg font-black text-amber-600">₹{combo.price}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-normal">
                    {combo.description || "No description provided."}
                  </p>

                  {/* Included Items Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Included Items ({combo.items?.length || 0})
                    </span>
                    <div className="space-y-1.5">
                      {combo.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                            • {item.productName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            {item.canRemove && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                                Removable
                              </span>
                            )}
                            {item.allowedReplacements && item.allowedReplacements.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                                {item.allowedReplacements.length} Replacements
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={combo.isAvailable}
                      onChange={(e) => onToggleAvailability(combo.id, e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Toggle</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(combo)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete combo "${combo.name}"?`)) {
                          onDeleteCombo(combo.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <ComboModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        comboToEdit={editingCombo}
        availableProducts={products}
      />
    </div>
  );
};
