"use client";

import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  HelpCircle,
  IndianRupee,
  Layers,
  Sparkles
} from "lucide-react";
import { CustomizationGroup, Product } from "@/types";
import { CustomizationGroupModal } from "./CustomizationGroupModal";

interface CustomizationTabProps {
  groups: CustomizationGroup[];
  products: Product[];
  onAddGroup: (data: Partial<CustomizationGroup>) => Promise<CustomizationGroup> | Promise<void>;
  onUpdateGroup: (id: string, updated: Partial<CustomizationGroup>) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
}

export const CustomizationTab: React.FC<CustomizationTabProps> = ({
  groups,
  products,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = groups.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group: CustomizationGroup) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<CustomizationGroup>) => {
    if (editingGroup) {
      await onUpdateGroup(editingGroup.id, data);
    } else {
      await onAddGroup(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customization groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Customization Group</span>
        </button>
      </div>

      {/* Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
            <Sliders className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Customization Groups</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Create customization groups (e.g. Sauce, Cooking Preference, Extras) to attach to single products or combos.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{group.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      group.isRequired ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {group.isRequired ? "Required" : "Optional"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                    {group.selectionType === "single" ? "Choose One" : "Multiple Selection"}
                  </span>
                  {group.selectionType === "multi" && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      (Min: {group.minSelection}, Max: {group.maxSelection})
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Available Choices ({group.options?.length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {group.options?.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
                      >
                        <span className="font-semibold text-slate-700">{opt.name}</span>
                        <span className={`font-bold ${opt.price === 0 ? "text-emerald-600" : "text-blue-700"}`}>
                          {opt.price === 0 ? "Free" : `₹${opt.price}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(group)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete customization group "${group.title}"?`)) {
                      onDeleteGroup(group.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CustomizationGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        groupToEdit={editingGroup}
        availableProducts={products}
      />
    </div>
  );
};
