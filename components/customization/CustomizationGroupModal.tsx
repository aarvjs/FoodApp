"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Check,
  Loader2,
  Sliders,
  Sparkles,
  IndianRupee
} from "lucide-react";
import { CustomizationGroup, CustomizationOption, Product } from "@/types";

interface CustomizationGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: Partial<CustomizationGroup>) => Promise<void>;
  groupToEdit?: CustomizationGroup | null;
  availableProducts?: Product[];
}

export const CustomizationGroupModal: React.FC<CustomizationGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  groupToEdit,
  availableProducts = []
}) => {
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState<"single" | "multi">("single");
  const [isRequired, setIsRequired] = useState(false);
  const [minSelection, setMinSelection] = useState(0);
  const [maxSelection, setMaxSelection] = useState(1);
  const [options, setOptions] = useState<CustomizationOption[]>([
    { id: "opt-1", name: "Option 1 (Free)", price: 0, isAvailable: true },
    { id: "opt-2", name: "Option 2", price: 20, isAvailable: true }
  ]);

  useEffect(() => {
    if (groupToEdit) {
      setTitle(groupToEdit.title || "");
      setSelectionType(groupToEdit.selectionType || "single");
      setIsRequired(groupToEdit.isRequired ?? false);
      setMinSelection(groupToEdit.minSelection ?? (groupToEdit.isRequired ? 1 : 0));
      setMaxSelection(groupToEdit.maxSelection ?? 1);
      setOptions(groupToEdit.options || []);
    } else {
      setTitle("");
      setSelectionType("single");
      setIsRequired(false);
      setMinSelection(0);
      setMaxSelection(1);
      setOptions([
        { id: "opt-1", name: "Ketchup", price: 0, isAvailable: true },
        { id: "opt-2", name: "Mayo", price: 10, isAvailable: true },
        { id: "opt-3", name: "Cheese Sauce", price: 20, isAvailable: true }
      ]);
    }
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: "opt-" + Date.now() + Math.random().toString(36).substring(2, 5),
        name: "New Customization",
        price: 15,
        isAvailable: true
      }
    ]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleUpdateOption = (id: string, field: keyof CustomizationOption, value: any) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title for the customization group.");
      return;
    }
    if (options.length === 0) {
      alert("Please add at least one option to the group.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        title,
        selectionType,
        isRequired,
        minSelection: Number(minSelection),
        maxSelection: Number(maxSelection),
        options,
        status: "ACTIVE"
      });
      onClose();
    } catch (err: any) {
      alert("Failed to save customization group: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {groupToEdit ? "Edit Customization Group" : "Create Customization Group"}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Configure Single/Multi selection rules, required choices, and option prices.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Details */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Group Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sauce, Extras, Cooking Preference"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Selection Mode</label>
                <select
                  value={selectionType}
                  onChange={(e) => {
                    const mode = e.target.value as "single" | "multi";
                    setSelectionType(mode);
                    if (mode === "single") setMaxSelection(1);
                  }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="single">Single Select (Choose One)</option>
                  <option value="multi">Multiple Selection (Choose Multiple)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Requirement Rule</label>
                <select
                  value={isRequired ? "REQUIRED" : "OPTIONAL"}
                  onChange={(e) => {
                    const req = e.target.value === "REQUIRED";
                    setIsRequired(req);
                    if (req && minSelection === 0) setMinSelection(1);
                  }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="OPTIONAL">Optional (Customer can skip)</option>
                  <option value="REQUIRED">Required (Customer must choose)</option>
                </select>
              </div>

              {selectionType === "multi" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Min Selection Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={minSelection}
                      onChange={(e) => setMinSelection(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Max Selection Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={maxSelection}
                      onChange={(e) => setMaxSelection(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Customization Options ({options.length})
                </h3>
                <p className="text-xs text-slate-500">Add choices with custom pricing (₹0 for free choices).</p>
              </div>

              <button
                type="button"
                onClick={handleAddOption}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Option Name (e.g. Ketchup, Extra Cheese, Well Done)"
                    value={opt.name}
                    onChange={(e) => handleUpdateOption(opt.id, "name", e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-800 w-1/2"
                  />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={opt.price}
                        onChange={(e) => handleUpdateOption(opt.id, "price", Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-blue-700 text-right"
                      />
                    </div>

                    <label className="flex items-center gap-1 cursor-pointer text-[11px] font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={opt.isAvailable}
                        onChange={(e) => handleUpdateOption(opt.id, "isAvailable", e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
