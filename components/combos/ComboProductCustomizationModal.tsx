"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Sliders,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Layers,
  CheckCircle2,
  XCircle,
  IndianRupee,
  AlertCircle
} from "lucide-react";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { sanitizeForFirestore } from "@/models/combo";
import { ComboItem, CustomizationGroup, CustomizationOption } from "@/types";
import { saveItemCustomizationGroups } from "@/services/comboService";

interface ComboProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ComboItem;
  comboName?: string;
  onSaved?: (updatedGroups: CustomizationGroup[]) => void;
}

export const ComboProductCustomizationModal: React.FC<ComboProductCustomizationModalProps> = ({
  isOpen,
  onClose,
  product,
  comboName,
  onSaved
}) => {
  const [groups, setGroups] = useState<CustomizationGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Group Form Modal state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [selectionType, setSelectionType] = useState<"single" | "multi">("single");
  const [isRequired, setIsRequired] = useState(true);
  const [minSelection, setMinSelection] = useState<number>(1);
  const [maxSelection, setMaxSelection] = useState<number>(1);

  // Option Form Modal state
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [targetGroupIndex, setTargetGroupIndex] = useState<number | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState<string>("0");
  const [optionIsAvailable, setOptionIsAvailable] = useState<boolean>(true);

  // Expanded group IDs for accordion view
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product && product.customizationGroups) {
      setGroups(product.customizationGroups);
      // Auto-expand all groups
      const initExpanded: Record<string, boolean> = {};
      product.customizationGroups.forEach((g) => {
        initExpanded[g.id] = true;
      });
      setExpandedGroupIds(initExpanded);
    } else {
      setGroups([]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // ==========================================
  // GROUP CRUD
  // ==========================================
  const handleOpenAddGroup = () => {
    setEditingGroupIndex(null);
    setGroupTitle("");
    setSelectionType("single");
    setIsRequired(true);
    setMinSelection(1);
    setMaxSelection(1);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (index: number) => {
    const g = groups[index];
    setEditingGroupIndex(index);
    setGroupTitle(g.title || "");
    setSelectionType(g.selectionType || "single");
    setIsRequired(g.isRequired ?? true);
    setMinSelection(g.minSelection !== undefined ? g.minSelection : (g.isRequired ? 1 : 0));
    setMaxSelection(g.maxSelection !== undefined ? g.maxSelection : (g.selectionType === "single" ? 1 : 5));
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) return;

    let updatedList = [...groups];
    if (editingGroupIndex !== null) {
      // Edit existing group
      updatedList[editingGroupIndex] = {
        ...updatedList[editingGroupIndex],
        title: groupTitle.trim(),
        selectionType,
        isRequired,
        minSelection: Number(minSelection) || (isRequired ? 1 : 0),
        maxSelection: Number(maxSelection) || (selectionType === "single" ? 1 : 5)
      };
    } else {
      // Add new group
      const newGroupId = `cg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newGroup: CustomizationGroup = {
        id: newGroupId,
        restaurantId: product.restaurantId || "",
        branchId: product.branchId,
        branchIds: product.branchIds,
        title: groupTitle.trim(),
        selectionType,
        isRequired,
        minSelection: Number(minSelection) || (isRequired ? 1 : 0),
        maxSelection: Number(maxSelection) || (selectionType === "single" ? 1 : 5),
        status: "ACTIVE",
        options: []
      };
      updatedList.push(newGroup);
      setExpandedGroupIds((prev) => ({ ...prev, [newGroupId]: true }));
    }

    setGroups(updatedList);
    setIsGroupModalOpen(false);
    await persistGroupsToFirestore(updatedList);
  };

  const handleDeleteGroup = async (index: number) => {
    const groupToDelete = groups[index];
    if (confirm(`Are you sure you want to delete customization group "${groupToDelete.title}"?`)) {
      const updatedList = groups.filter((_, idx) => idx !== index);
      setGroups(updatedList);
      await persistGroupsToFirestore(updatedList);
    }
  };

  // ==========================================
  // OPTION CRUD
  // ==========================================
  const handleOpenAddOption = (groupIndex: number) => {
    setTargetGroupIndex(groupIndex);
    setEditingOptionIndex(null);
    setOptionName("");
    setOptionPrice("0");
    setOptionIsAvailable(true);
    setIsOptionModalOpen(true);
  };

  const handleOpenEditOption = (groupIndex: number, optionIndex: number) => {
    const opt = groups[groupIndex].options[optionIndex];
    setTargetGroupIndex(groupIndex);
    setEditingOptionIndex(optionIndex);
    setOptionName(opt.name || "");
    setOptionPrice(opt.price !== undefined ? opt.price.toString() : "0");
    setOptionIsAvailable(opt.isAvailable !== false);
    setIsOptionModalOpen(true);
  };

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetGroupIndex === null || !optionName.trim()) return;

    const numPrice = Number(optionPrice);
    if (isNaN(numPrice) || numPrice < 0) return;

    const updatedGroups = [...groups];
    const targetGroup = { ...updatedGroups[targetGroupIndex] };
    const currentOptions = [...(targetGroup.options || [])];

    if (editingOptionIndex !== null) {
      // Edit existing option
      currentOptions[editingOptionIndex] = {
        ...currentOptions[editingOptionIndex],
        name: optionName.trim(),
        price: numPrice,
        isAvailable: optionIsAvailable
      };
    } else {
      // Add new option
      const newOptionId = `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      currentOptions.push({
        id: newOptionId,
        name: optionName.trim(),
        price: numPrice,
        isAvailable: optionIsAvailable
      });
    }

    targetGroup.options = currentOptions;
    updatedGroups[targetGroupIndex] = targetGroup;

    setGroups(updatedGroups);
    setIsOptionModalOpen(false);
    await persistGroupsToFirestore(updatedGroups);
  };

  const handleDeleteOption = async (groupIndex: number, optionIndex: number) => {
    const opt = groups[groupIndex].options[optionIndex];
    if (confirm(`Are you sure you want to delete option "${opt.name}"?`)) {
      const updatedGroups = [...groups];
      const targetGroup = { ...updatedGroups[groupIndex] };
      targetGroup.options = targetGroup.options.filter((_, idx) => idx !== optionIndex);
      updatedGroups[groupIndex] = targetGroup;

      setGroups(updatedGroups);
      await persistGroupsToFirestore(updatedGroups);
    }
  };

  const handleToggleOptionAvailable = async (groupIndex: number, optionIndex: number) => {
    const updatedGroups = [...groups];
    const targetGroup = { ...updatedGroups[groupIndex] };
    const currentOptions = [...targetGroup.options];
    const opt = currentOptions[optionIndex];

    currentOptions[optionIndex] = {
      ...opt,
      isAvailable: !opt.isAvailable
    };

    targetGroup.options = currentOptions;
    updatedGroups[groupIndex] = targetGroup;

    setGroups(updatedGroups);
    await persistGroupsToFirestore(updatedGroups);
  };

  // ==========================================
  // FIRESTORE PERSISTENCE
  // ==========================================
  const persistGroupsToFirestore = async (latestGroups: CustomizationGroup[]) => {
    setSaving(true);
    setStatusMessage(null);
    try {
      if (typeof saveItemCustomizationGroups === "function") {
        await saveItemCustomizationGroups(product.id, latestGroups);
      } else {
        const docRef = doc(db, "comboItems", product.id);
        const sanitizedGroups = sanitizeForFirestore(latestGroups);
        await updateDoc(docRef, {
          customizationGroups: sanitizedGroups,
          isCustomisable: latestGroups.length > 0,
          updatedAt: new Date().toISOString()
        });
      }
      setStatusMessage({ type: "success", text: "Customization saved to Firestore in real time!" });
      if (onSaved) onSaved(latestGroups);
    } catch (err: any) {
      console.error("Failed to save customization groups:", err);
      // Fallback direct update
      try {
        const docRef = doc(db, "comboItems", product.id);
        const sanitizedGroups = sanitizeForFirestore(latestGroups);
        await updateDoc(docRef, {
          customizationGroups: sanitizedGroups,
          isCustomisable: latestGroups.length > 0,
          updatedAt: new Date().toISOString()
        });
        setStatusMessage({ type: "success", text: "Customization saved to Firestore in real time!" });
        if (onSaved) onSaved(latestGroups);
      } catch (fallbackErr: any) {
        setStatusMessage({ type: "error", text: "Failed to save: " + fallbackErr.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                  Combo Product Customization
                </span>
                {comboName ? (
                  <span className="text-xs text-slate-500 font-bold">
                    Combo: {comboName}
                  </span>
                ) : null}
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{product.name}</span>
                <span className="text-xs font-black text-amber-600 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg">
                  Base Price: ₹{product.price}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Firestore...</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-red-50 text-red-800 border-b border-red-200"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner Action */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Customization Groups for "{product.name}"
              </h3>
              <p className="text-[11.5px] text-slate-500 mt-1 max-w-xl leading-relaxed">
                Manually configure option groups (e.g. <b>Choose Pizza</b>, <b>Choose Extra</b>, <b>Extra Ketchup</b>) specifically for this item. Options will never be shared with other products.
              </p>
            </div>

            <button
              onClick={handleOpenAddGroup}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Option Group</span>
            </button>
          </div>

          {/* Customization Groups List */}
          {groups.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Layers className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-slate-800">No Customization Groups Configured Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click <b>"+ Add Option Group"</b> to manually create groups like <i>Choose Pizza</i>, <i>Choose Extra</i>, or <i>Extra Ketchup</i>.
              </p>
              <button
                onClick={handleOpenAddGroup}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Option Group
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((group, gIdx) => {
                const isExpanded = expandedGroupIds[group.id] ?? true;
                const optionsCount = group.options?.length || 0;

                return (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200"
                  >
                    {/* Group Header Card */}
                    <div className="p-4 bg-slate-50/90 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div
                        onClick={() => toggleGroupExpand(group.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                          {gIdx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900">{group.title}</h4>
                            <span
                              className={`px-2 py-0.5 text-[9.5px] font-black uppercase rounded-md ${
                                group.selectionType === "single"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {group.selectionType === "single" ? "Single Selection" : "Multiple Selection"}
                            </span>

                            <span
                              className={`px-2 py-0.5 text-[9.5px] font-black uppercase rounded-md ${
                                group.isRequired
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {group.isRequired ? "Required (Yes)" : "Optional (No)"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 font-semibold">
                            <span>Min: {group.minSelection ?? (group.isRequired ? 1 : 0)}</span>
                            <span>•</span>
                            <span>Max: {group.maxSelection ?? (group.selectionType === "single" ? 1 : 5)}</span>
                            <span>•</span>
                            <span>{optionsCount} Option{optionsCount === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Group Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenAddOption(gIdx)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditGroup(gIdx)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteGroup(gIdx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleGroupExpand(group.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Group Options (Accordion body) */}
                    {isExpanded && (
                      <div className="p-4 bg-white space-y-2">
                        {optionsCount === 0 ? (
                          <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 font-medium space-y-2">
                            <p>No options added in "{group.title}" yet.</p>
                            <button
                              onClick={() => handleOpenAddOption(gIdx)}
                              className="px-3 py-1 bg-amber-600 text-white text-[11px] font-bold rounded-lg cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Option
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {group.options.map((opt, oIdx) => (
                              <div
                                key={opt.id || oIdx}
                                className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 px-3 rounded-xl transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleOptionAvailable(gIdx, oIdx)}
                                    className="cursor-pointer"
                                    title={opt.isAvailable !== false ? "Active (Click to Disable)" : "Disabled (Click to Enable)"}
                                  >
                                    {opt.isAvailable !== false ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-slate-300" />
                                    )}
                                  </button>

                                  <div>
                                    <span
                                      className={`text-xs font-extrabold ${
                                        opt.isAvailable !== false
                                          ? "text-slate-800"
                                          : "text-slate-400 line-through"
                                      }`}
                                    >
                                      {opt.name}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Price Tag */}
                                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black rounded-lg">
                                    {opt.price > 0 ? `+₹${opt.price}` : "₹0"}
                                  </span>

                                  {/* Edit / Delete option */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditOption(gIdx, oIdx)}
                                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Option"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOption(gIdx, oIdx)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Option"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            {groups.length} Customization Group{groups.length === 1 ? "" : "s"} linked specifically to {product.name}
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow"
          >
            Done
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SUB-MODAL 1: ADD / EDIT CUSTOMIZATION GROUP */}
        {/* ---------------------------------------------------- */}
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900">
                  {editingGroupIndex !== null ? "Edit Option Group" : "Add Option Group"}
                </h3>
                <button
                  onClick={() => setIsGroupModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
                {/* 1. Group Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Choose Pizza, Choose Extra, Extra Ketchup"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* 2. Selection Type: Single / Multi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Selection Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionType("single");
                        setMaxSelection(1);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        selectionType === "single"
                          ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Single Selection
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectionType("multi");
                        if (maxSelection <= 1) setMaxSelection(5);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        selectionType === "multi"
                          ? "bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Multiple Selection
                    </button>
                  </div>
                </div>

                {/* 3. Required: Yes / No */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Required / Optional
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRequired(true);
                        if (minSelection < 1) setMinSelection(1);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        isRequired
                          ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Required (Yes)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsRequired(false);
                        setMinSelection(0);
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        !isRequired
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Optional (No)
                    </button>
                  </div>
                </div>

                {/* 4. Min & Max Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Minimum Selection
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={minSelection}
                      onChange={(e) => setMinSelection(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Maximum Selection
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={maxSelection}
                      onChange={(e) => setMaxSelection(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    {editingGroupIndex !== null ? "Save Group" : "Create Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUB-MODAL 2: ADD / EDIT OPTION */}
        {/* ---------------------------------------------------- */}
        {isOptionModalOpen && targetGroupIndex !== null && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    {editingOptionIndex !== null ? "Edit Option" : "Add Option"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Inside: {groups[targetGroupIndex]?.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsOptionModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSaveOption} className="p-6 space-y-4">
                {/* 1. Option Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Option Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Onion Pizza [Reg], Extra Cheese, Ketchup x 2"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* 2. Additional Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Additional Price (₹) <span className="text-slate-400 font-normal">(0 for free / included)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="0"
                    value={optionPrice}
                    onChange={(e) => setOptionPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* 3. Availability Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Active Status</span>
                    <span className="block text-[10px] text-slate-500">Enable or disable this option</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOptionIsAvailable(!optionIsAvailable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      optionIsAvailable ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        optionIsAvailable ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOptionModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    {editingOptionIndex !== null ? "Save Option" : "Add Option"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
