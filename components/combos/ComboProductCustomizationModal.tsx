"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Layers,
  CheckCircle2,
  XCircle,
  Tag,
  ToggleLeft,
  ToggleRight,
  Package,
  Utensils
} from "lucide-react";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { sanitizeForFirestore } from "@/models/combo";
import {
  ComboItem,
  CustomizationGroup,
  ComboItemVariant,
  ComboVariantItem,
  ComboVariantOption
} from "@/types";
import {
  saveItemCustomizationGroups,
  saveItemVariants
} from "@/services/comboService";

interface ComboProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ComboItem;
  comboName?: string;
  onSaved?: (updatedGroups: CustomizationGroup[], isVariantEnabled?: boolean, variants?: ComboItemVariant[]) => void;
}

export const ComboProductCustomizationModal: React.FC<ComboProductCustomizationModalProps> = ({
  isOpen,
  onClose,
  product,
  comboName,
  onSaved
}) => {
  const [groups, setGroups] = useState<CustomizationGroup[]>([]);
  const [isVariantEnabled, setIsVariantEnabled] = useState<boolean>(false);
  const [variants, setVariants] = useState<ComboItemVariant[]>([]);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Group Form Modal state (Standard Customization Groups - when Variant Config is OFF)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [selectionType, setSelectionType] = useState<"single" | "multi">("single");
  const [isRequired, setIsRequired] = useState(true);
  const [minSelection, setMinSelection] = useState<number>(1);
  const [maxSelection, setMaxSelection] = useState<number>(1);

  // Option Form Modal state (Standard Options - when Variant Config is OFF)
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [targetGroupIndex, setTargetGroupIndex] = useState<number | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState<string>("0");
  const [optionIsAvailable, setOptionIsAvailable] = useState<boolean>(true);

  // Variant Form Modal state (Level 1: Size / Variant)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [variantName, setVariantName] = useState("");

  // Variant Item Form Modal state (Level 2: Item / Product inside Size Variant)
  const [isVarItemModalOpen, setIsVarItemModalOpen] = useState(false);
  const [targetVariantIndexForItem, setTargetVariantIndexForItem] = useState<number | null>(null);
  const [editingVarItemIndex, setEditingVarItemIndex] = useState<number | null>(null);
  const [varItemName, setVarItemName] = useState("");
  const [varItemDescription, setVarItemDescription] = useState("");

  // Variant Option Form Modal state (Level 3: Option / Extra inside Item)
  const [isVarOptionModalOpen, setIsVarOptionModalOpen] = useState(false);
  const [targetVariantIndexForOption, setTargetVariantIndexForOption] = useState<number | null>(null);
  const [targetItemIndexForOption, setTargetItemIndexForOption] = useState<number | null>(null);
  const [editingVarOptionIndex, setEditingVarOptionIndex] = useState<number | null>(null);
  const [varOptionName, setVarOptionName] = useState("");
  const [varOptionPrice, setVarOptionPrice] = useState<string>("0");
  const [varOptionIsActive, setVarOptionIsActive] = useState<boolean>(true);

  // Accordion expanded state
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});
  const [expandedVariantIds, setExpandedVariantIds] = useState<Record<string, boolean>>({});
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product) {
      setGroups(product.customizationGroups || []);
      const varEnabled = Boolean(product.isVariantEnabled);
      setIsVariantEnabled(varEnabled);
      const initialVariants = product.variants || [];
      setVariants(initialVariants);

      const initGroupExpanded: Record<string, boolean> = {};
      (product.customizationGroups || []).forEach((g) => {
        initGroupExpanded[g.id] = true;
      });
      setExpandedGroupIds(initGroupExpanded);

      const initVarExpanded: Record<string, boolean> = {};
      const initItemExpanded: Record<string, boolean> = {};
      initialVariants.forEach((v) => {
        initVarExpanded[v.id] = true;
        (v.items || []).forEach((item) => {
          initItemExpanded[item.id] = true;
        });
      });
      setExpandedVariantIds(initVarExpanded);
      setExpandedItemIds(initItemExpanded);
    } else {
      setGroups([]);
      setIsVariantEnabled(false);
      setVariants([]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleVariantExpand = (variantId: string) => {
    setExpandedVariantIds((prev) => ({ ...prev, [variantId]: !prev[variantId] }));
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItemIds((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // ==========================================
  // VARIANT MODE TOGGLE
  // ==========================================
  const handleToggleVariantEnabled = async (enabled: boolean) => {
    setIsVariantEnabled(enabled);
    let updatedVariants = variants;
    if (enabled && variants.length === 0) {
      // Pre-populate with Small / Medium / Large sample variants for instant convenience
      updatedVariants = [
        {
          id: `var-${Date.now()}-1`,
          name: "Small",
          isActive: true,
          items: [
            {
              id: `vitem-${Date.now()}-1-1`,
              name: "Pizza",
              description: "Small Pizza",
              isActive: true,
              options: [
                { id: `vopt-${Date.now()}-1-1-1`, name: "Extra Cheese", additionalPrice: 20, isActive: true },
                { id: `vopt-${Date.now()}-1-1-2`, name: "Ketchup", additionalPrice: 5, isActive: true }
              ]
            }
          ]
        },
        {
          id: `var-${Date.now()}-2`,
          name: "Medium",
          isActive: true,
          items: [
            {
              id: `vitem-${Date.now()}-2-1`,
              name: "Pizza",
              description: "Medium Pizza",
              isActive: true,
              options: [
                { id: `vopt-${Date.now()}-2-1-1`, name: "Extra Cheese", additionalPrice: 30, isActive: true },
                { id: `vopt-${Date.now()}-2-1-2`, name: "Extra Topping", additionalPrice: 20, isActive: true }
              ]
            }
          ]
        },
        {
          id: `var-${Date.now()}-3`,
          name: "Large",
          isActive: true,
          items: [
            {
              id: `vitem-${Date.now()}-3-1`,
              name: "Pizza",
              description: "Large Pizza",
              isActive: true,
              options: [
                { id: `vopt-${Date.now()}-3-1-1`, name: "Extra Cheese", additionalPrice: 40, isActive: true },
                { id: `vopt-${Date.now()}-3-1-2`, name: "Extra Topping", additionalPrice: 30, isActive: true },
                { id: `vopt-${Date.now()}-3-1-3`, name: "Ketchup", additionalPrice: 10, isActive: true }
              ]
            }
          ]
        }
      ];
      setVariants(updatedVariants);
      const initVarExpanded: Record<string, boolean> = {};
      const initItemExpanded: Record<string, boolean> = {};
      updatedVariants.forEach((v) => {
        initVarExpanded[v.id] = true;
        (v.items || []).forEach((it) => (initItemExpanded[it.id] = true));
      });
      setExpandedVariantIds(initVarExpanded);
      setExpandedItemIds(initItemExpanded);
    }
    await persistVariantsToFirestore(enabled, updatedVariants);
  };

  // ==========================================
  // LEVEL 1: VARIANT CRUD (Small, Medium, Large)
  // ==========================================
  const handleOpenAddVariant = () => {
    setEditingVariantIndex(null);
    setVariantName("");
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariant = (vIdx: number) => {
    setEditingVariantIndex(vIdx);
    setVariantName(variants[vIdx].name || "");
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantName.trim()) return;

    let updatedList = [...variants];
    if (editingVariantIndex !== null) {
      updatedList[editingVariantIndex] = {
        ...updatedList[editingVariantIndex],
        name: variantName.trim()
      };
    } else {
      const newVarId = `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newVariant: ComboItemVariant = {
        id: newVarId,
        name: variantName.trim(),
        isActive: true,
        items: []
      };
      updatedList.push(newVariant);
      setExpandedVariantIds((prev) => ({ ...prev, [newVarId]: true }));
    }

    setVariants(updatedList);
    setIsVariantModalOpen(false);
    await persistVariantsToFirestore(isVariantEnabled, updatedList);
  };

  const handleDeleteVariant = async (vIdx: number) => {
    const varToDelete = variants[vIdx];
    if (confirm(`Are you sure you want to delete size variant "${varToDelete.name}"?`)) {
      const updatedList = variants.filter((_, idx) => idx !== vIdx);
      setVariants(updatedList);
      await persistVariantsToFirestore(isVariantEnabled, updatedList);
    }
  };

  const handleToggleVariantActive = async (vIdx: number) => {
    const updatedList = [...variants];
    updatedList[vIdx] = {
      ...updatedList[vIdx],
      isActive: !updatedList[vIdx].isActive
    };
    setVariants(updatedList);
    await persistVariantsToFirestore(isVariantEnabled, updatedList);
  };

  // ==========================================
  // LEVEL 2: VARIANT ITEM CRUD (Pizza, Garlic Bread, Cold Drink inside Size)
  // ==========================================
  const handleOpenAddVarItem = (vIdx: number) => {
    setTargetVariantIndexForItem(vIdx);
    setEditingVarItemIndex(null);
    setVarItemName("");
    setVarItemDescription("");
    setIsVarItemModalOpen(true);
  };

  const handleOpenEditVarItem = (vIdx: number, iIdx: number) => {
    const targetItem = (variants[vIdx].items || [])[iIdx];
    setTargetVariantIndexForItem(vIdx);
    setEditingVarItemIndex(iIdx);
    setVarItemName(targetItem.name || "");
    setVarItemDescription(targetItem.description || "");
    setIsVarItemModalOpen(true);
  };

  const handleSaveVarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetVariantIndexForItem === null || !varItemName.trim()) return;

    const updatedVariants = [...variants];
    const targetVar = { ...updatedVariants[targetVariantIndexForItem] };
    const currentItems = [...(targetVar.items || [])];

    if (editingVarItemIndex !== null) {
      currentItems[editingVarItemIndex] = {
        ...currentItems[editingVarItemIndex],
        name: varItemName.trim(),
        description: varItemDescription.trim()
      };
    } else {
      const newVarItemId = `vitem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      currentItems.push({
        id: newVarItemId,
        name: varItemName.trim(),
        description: varItemDescription.trim(),
        isActive: true,
        options: []
      });
      setExpandedItemIds((prev) => ({ ...prev, [newVarItemId]: true }));
    }

    targetVar.items = currentItems;
    updatedVariants[targetVariantIndexForItem] = targetVar;

    setVariants(updatedVariants);
    setIsVarItemModalOpen(false);
    await persistVariantsToFirestore(isVariantEnabled, updatedVariants);
  };

  const handleDeleteVarItem = async (vIdx: number, iIdx: number) => {
    const itemToDelete = (variants[vIdx].items || [])[iIdx];
    if (confirm(`Are you sure you want to delete item "${itemToDelete.name}" from ${variants[vIdx].name}?`)) {
      const updatedVariants = [...variants];
      const targetVar = { ...updatedVariants[vIdx] };
      targetVar.items = (targetVar.items || []).filter((_, idx) => idx !== iIdx);
      updatedVariants[vIdx] = targetVar;

      setVariants(updatedVariants);
      await persistVariantsToFirestore(isVariantEnabled, updatedVariants);
    }
  };

  const handleToggleVarItemActive = async (vIdx: number, iIdx: number) => {
    const updatedVariants = [...variants];
    const targetVar = { ...updatedVariants[vIdx] };
    const currentItems = [...(targetVar.items || [])];

    currentItems[iIdx] = {
      ...currentItems[iIdx],
      isActive: !currentItems[iIdx].isActive
    };

    targetVar.items = currentItems;
    updatedVariants[vIdx] = targetVar;

    setVariants(updatedVariants);
    await persistVariantsToFirestore(isVariantEnabled, updatedVariants);
  };

  // ==========================================
  // LEVEL 3: VARIANT OPTION CRUD (Extra Cheese +₹30 inside Item inside Size)
  // ==========================================
  const handleOpenAddVarOption = (vIdx: number, iIdx: number) => {
    setTargetVariantIndexForOption(vIdx);
    setTargetItemIndexForOption(iIdx);
    setEditingVarOptionIndex(null);
    setVarOptionName("");
    setVarOptionPrice("0");
    setVarOptionIsActive(true);
    setIsVarOptionModalOpen(true);
  };

  const handleOpenEditVarOption = (vIdx: number, iIdx: number, oIdx: number) => {
    const targetItem = (variants[vIdx].items || [])[iIdx];
    const opt = (targetItem.options || [])[oIdx];

    setTargetVariantIndexForOption(vIdx);
    setTargetItemIndexForOption(iIdx);
    setEditingVarOptionIndex(oIdx);
    setVarOptionName(opt.name || "");
    setVarOptionPrice(opt.additionalPrice !== undefined ? opt.additionalPrice.toString() : "0");
    setVarOptionIsActive(opt.isActive !== false);
    setIsVarOptionModalOpen(true);
  };

  const handleSaveVarOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      targetVariantIndexForOption === null ||
      targetItemIndexForOption === null ||
      !varOptionName.trim()
    )
      return;

    const numPrice = Number(varOptionPrice);
    if (isNaN(numPrice) || numPrice < 0) return;

    const updatedVariants = [...variants];
    const targetVar = { ...updatedVariants[targetVariantIndexForOption] };
    const currentItems = [...(targetVar.items || [])];
    const targetItem = { ...currentItems[targetItemIndexForOption] };
    const currentOptions = [...(targetItem.options || [])];

    if (editingVarOptionIndex !== null) {
      currentOptions[editingVarOptionIndex] = {
        ...currentOptions[editingVarOptionIndex],
        name: varOptionName.trim(),
        additionalPrice: numPrice,
        isActive: varOptionIsActive
      };
    } else {
      const newOptId = `vopt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      currentOptions.push({
        id: newOptId,
        name: varOptionName.trim(),
        additionalPrice: numPrice,
        isActive: varOptionIsActive
      });
    }

    targetItem.options = currentOptions;
    currentItems[targetItemIndexForOption] = targetItem;
    targetVar.items = currentItems;
    updatedVariants[targetVariantIndexForOption] = targetVar;

    setVariants(updatedVariants);
    setIsVarOptionModalOpen(false);
    await persistVariantsToFirestore(isVariantEnabled, updatedVariants);
  };

  const handleDeleteVarOption = async (vIdx: number, iIdx: number, oIdx: number) => {
    const targetItem = (variants[vIdx].items || [])[iIdx];
    const opt = (targetItem.options || [])[oIdx];
    if (confirm(`Are you sure you want to delete option "${opt.name}" from ${targetItem.name}?`)) {
      const updatedVariants = [...variants];
      const targetVar = { ...updatedVariants[vIdx] };
      const currentItems = [...(targetVar.items || [])];
      const targetItemObj = { ...currentItems[iIdx] };
      targetItemObj.options = (targetItemObj.options || []).filter((_, idx) => idx !== oIdx);
      currentItems[iIdx] = targetItemObj;
      targetVar.items = currentItems;
      updatedVariants[vIdx] = targetVar;

      setVariants(updatedVariants);
      await persistVariantsToFirestore(isVariantEnabled, updatedVariants);
    }
  };

  const handleToggleVarOptionActive = async (vIdx: number, iIdx: number, oIdx: number) => {
    const updatedVariants = [...variants];
    const targetVar = { ...updatedVariants[vIdx] };
    const currentItems = [...(targetVar.items || [])];
    const targetItemObj = { ...currentItems[iIdx] };
    const currentOptions = [...(targetItemObj.options || [])];
    const opt = currentOptions[oIdx];

    currentOptions[oIdx] = {
      ...opt,
      isActive: !opt.isActive
    };

    targetItemObj.options = currentOptions;
    currentItems[iIdx] = targetItemObj;
    targetVar.items = currentItems;
    updatedVariants[vIdx] = targetVar;

    setVariants(updatedVariants);
    await persistVariantsToFirestore(isVariantEnabled, updatedVariants);
  };

  // ==========================================
  // STANDARD CUSTOMIZATION GROUPS CRUD (Variant Config OFF)
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
      updatedList[editingGroupIndex] = {
        ...updatedList[editingGroupIndex],
        title: groupTitle.trim(),
        selectionType,
        isRequired,
        minSelection: Number(minSelection) || (isRequired ? 1 : 0),
        maxSelection: Number(maxSelection) || (selectionType === "single" ? 1 : 5)
      };
    } else {
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

  // Standard Options CRUD
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
      currentOptions[editingOptionIndex] = {
        ...currentOptions[editingOptionIndex],
        name: optionName.trim(),
        price: numPrice,
        isAvailable: optionIsAvailable
      };
    } else {
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
          isCustomisable: latestGroups.length > 0 || isVariantEnabled,
          updatedAt: new Date().toISOString()
        });
      }
      setStatusMessage({ type: "success", text: "Customization saved to Firestore in real time!" });
      if (onSaved) onSaved(latestGroups, isVariantEnabled, variants);
    } catch (err: any) {
      console.error("Failed to save customization groups:", err);
      setStatusMessage({ type: "error", text: "Failed to save: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const persistVariantsToFirestore = async (enabled: boolean, latestVariants: ComboItemVariant[]) => {
    setSaving(true);
    setStatusMessage(null);
    try {
      if (typeof saveItemVariants === "function") {
        await saveItemVariants(product.id, enabled, latestVariants);
      } else {
        const docRef = doc(db, "comboItems", product.id);
        const sanitizedVariants = sanitizeForFirestore(latestVariants);
        await updateDoc(docRef, {
          isVariantEnabled: enabled,
          variants: sanitizedVariants,
          isCustomisable: enabled || groups.length > 0,
          updatedAt: new Date().toISOString()
        });
      }
      setStatusMessage({ type: "success", text: "Variant configuration saved to Firestore!" });
      if (onSaved) onSaved(groups, enabled, latestVariants);
    } catch (err: any) {
      console.error("Failed to save variant configuration:", err);
      setStatusMessage({ type: "error", text: "Failed to save variants: " + err.message });
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
                  Combo Product Options
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
                <span>Updating...</span>
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
          {/* 1. VARIANT CONFIGURATION TOGGLE CARD */}
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-slate-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-black text-slate-900">
                  Enable Size / Variant Configuration
                </h3>
                <span className={`px-2 py-0.5 text-[9.5px] font-black rounded-md ${isVariantEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                  {isVariantEnabled ? "ENABLED (ON)" : "DISABLED (OFF)"}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 font-medium max-w-xl leading-relaxed">
                Configure sizes (<b>Small</b>, <b>Medium</b>, <b>Large</b>), add items inside each size (<b>Pizza</b>, <b>Garlic Bread</b>, <b>Drinks</b>), and set specific options per item.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggleVariantEnabled(!isVariantEnabled)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm ${
                isVariantEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-900 hover:bg-black text-white"
              }`}
            >
              {isVariantEnabled ? (
                <>
                  <ToggleRight className="w-5 h-5 text-white" />
                  <span>Variant Configuration ON</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span>Enable Size / Variant Configuration</span>
                </>
              )}
            </button>
          </div>

          {/* 2. IF VARIANT CONFIGURATION IS ON */}
          {isVariantEnabled ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Action Banner */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Size Variants → Items → Options Configuration
                  </h4>
                  <p className="text-[11px] text-amber-800/80 mt-0.5 font-medium">
                    Flow: <b>Size Variant</b> (Small/Medium/Large) → <b>Add Item</b> (Pizza/Garlic Bread/Drinks) → <b>Add Options</b> (Extra Cheese/Ketchup).
                  </p>
                </div>

                <button
                  onClick={handleOpenAddVariant}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Size / Variant</span>
                </button>
              </div>

              {/* Variants List */}
              {variants.length === 0 ? (
                <div className="text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Tag className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">No Size Variants Added Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click <b>"+ Add Size / Variant"</b> to create size options like <i>Small</i>, <i>Medium</i>, <i>Large</i>, or <i>Half / Full</i>.
                  </p>
                  <button
                    onClick={handleOpenAddVariant}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add First Size Variant
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {variants.map((variant, vIdx) => {
                    const isExpanded = expandedVariantIds[variant.id] ?? true;
                    const itemsList = variant.items || [];
                    const itemsCount = itemsList.length;

                    return (
                      <div
                        key={variant.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                          variant.isActive !== false ? "border-amber-300 ring-1 ring-amber-400/20" : "border-slate-200 opacity-60"
                        }`}
                      >
                        {/* Level 1: Variant Header Card */}
                        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div
                            onClick={() => toggleVariantExpand(variant.id)}
                            className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                              {vIdx + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-slate-900">{variant.name}</h4>
                                <span
                                  className={`px-2 py-0.5 text-[9.5px] font-black uppercase rounded-md ${
                                    variant.isActive !== false
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {variant.isActive !== false ? "Active Size" : "Disabled"}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                                {itemsCount} Item{itemsCount === 1 ? "" : "s"} inside {variant.name}
                              </div>
                            </div>
                          </div>

                          {/* Level 1: Variant Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleVariantActive(vIdx)}
                              className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer ${
                                variant.isActive !== false
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {variant.isActive !== false ? "Disable Size" : "Enable Size"}
                            </button>

                            <button
                              onClick={() => handleOpenAddVarItem(vIdx)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Item to {variant.name}</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditVariant(vIdx)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Rename</span>
                            </button>

                            <button
                              onClick={() => handleDeleteVariant(vIdx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => toggleVariantExpand(variant.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Level 2: Items List Body inside Variant */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50/50 space-y-4">
                            {itemsCount === 0 ? (
                              <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 font-medium space-y-2">
                                <p>No items (e.g. Pizza, Garlic Bread, Drinks) added inside "{variant.name}" size yet.</p>
                                <button
                                  onClick={() => handleOpenAddVarItem(vIdx)}
                                  className="px-3.5 py-1.5 bg-amber-600 text-white text-[11px] font-extrabold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add First Item to {variant.name}
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {itemsList.map((item, iIdx) => {
                                  const isItemExpanded = expandedItemIds[item.id] ?? true;
                                  const optionsList = item.options || [];
                                  const optionsCount = optionsList.length;

                                  return (
                                    <div
                                      key={item.id}
                                      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-sm ${
                                        item.isActive !== false ? "border-slate-200" : "border-slate-200 opacity-60"
                                      }`}
                                    >
                                      {/* Item Header */}
                                      <div className="p-3 bg-slate-100/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div
                                          onClick={() => toggleItemExpand(item.id)}
                                          className="flex items-center gap-2.5 cursor-pointer flex-1 select-none"
                                        >
                                          <div className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-[11px] flex items-center justify-center">
                                            <Utensils className="w-3.5 h-3.5" />
                                          </div>

                                          <div>
                                            <div className="flex items-center gap-2">
                                              <h5 className="text-xs font-black text-slate-900">{item.name}</h5>
                                              <span
                                                className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded ${
                                                  item.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                                                }`}
                                              >
                                                {item.isActive !== false ? "Active Item" : "Disabled"}
                                              </span>
                                            </div>
                                            {item.description ? (
                                              <p className="text-[10.5px] text-slate-500 font-medium">{item.description}</p>
                                            ) : null}
                                          </div>
                                        </div>

                                        {/* Item Actions */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleVarItemActive(vIdx, iIdx)}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                                              item.isActive !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
                                            }`}
                                          >
                                            {item.isActive !== false ? "Disable" : "Enable"}
                                          </button>

                                          <button
                                            onClick={() => handleOpenAddVarOption(vIdx, iIdx)}
                                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10.5px] font-black rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Add Option to {item.name}</span>
                                          </button>

                                          <button
                                            onClick={() => handleOpenEditVarItem(vIdx, iIdx)}
                                            className="px-2 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[10.5px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                            <span>Edit</span>
                                          </button>

                                          <button
                                            onClick={() => handleDeleteVarItem(vIdx, iIdx)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                            title="Delete Item"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>

                                          <button
                                            onClick={() => toggleItemExpand(item.id)}
                                            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                                          >
                                            {isItemExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Level 3: Options List Body inside Item */}
                                      {isItemExpanded && (
                                        <div className="p-3 bg-white space-y-1.5">
                                          {optionsCount === 0 ? (
                                            <div className="text-center py-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-400 font-medium flex items-center justify-between px-3">
                                              <span>No options (e.g. Extra Cheese +₹30) added to "{item.name}" yet.</span>
                                              <button
                                                onClick={() => handleOpenAddVarOption(vIdx, iIdx)}
                                                className="px-2.5 py-1 bg-amber-600 text-white text-[10.5px] font-bold rounded cursor-pointer inline-flex items-center gap-1"
                                              >
                                                <Plus className="w-3 h-3" /> Add Option
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="divide-y divide-slate-100">
                                              {optionsList.map((opt, oIdx) => (
                                                <div
                                                  key={opt.id || oIdx}
                                                  className="py-1.5 flex items-center justify-between hover:bg-slate-50/80 px-2.5 rounded-lg transition-colors"
                                                >
                                                  <div className="flex items-center gap-2.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => handleToggleVarOptionActive(vIdx, iIdx, oIdx)}
                                                      className="cursor-pointer"
                                                      title={opt.isActive !== false ? "Active (Click to Disable)" : "Disabled (Click to Enable)"}
                                                    >
                                                      {opt.isActive !== false ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                      ) : (
                                                        <XCircle className="w-4 h-4 text-slate-300" />
                                                      )}
                                                    </button>

                                                    <span
                                                      className={`text-xs font-bold ${
                                                        opt.isActive !== false ? "text-slate-800" : "text-slate-400 line-through"
                                                      }`}
                                                    >
                                                      {opt.name}
                                                    </span>
                                                  </div>

                                                  <div className="flex items-center gap-2.5">
                                                    {/* Additional Price Badge */}
                                                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black rounded-md">
                                                      {opt.additionalPrice > 0 ? `+₹${opt.additionalPrice}` : "₹0"}
                                                    </span>

                                                    <div className="flex items-center gap-1">
                                                      <button
                                                        type="button"
                                                        onClick={() => handleOpenEditVarOption(vIdx, iIdx, oIdx)}
                                                        className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                                        title="Edit Option"
                                                      >
                                                        <Edit3 className="w-3 h-3" />
                                                      </button>

                                                      <button
                                                        type="button"
                                                        onClick={() => handleDeleteVarOption(vIdx, iIdx, oIdx)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                        title="Delete Option"
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* 3. IF VARIANT CONFIGURATION IS OFF (STANDARD CUSTOMIZATION GROUPS) */
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Banner Action */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Standard Customization Groups for "{product.name}"
                  </h3>
                  <p className="text-[11.5px] text-slate-500 mt-1 max-w-xl leading-relaxed">
                    Manually configure option groups (e.g. <b>Choose Pizza</b>, <b>Choose Extra</b>, <b>Extra Ketchup</b>) specifically for this item.
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
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            {isVariantEnabled
              ? `${variants.length} Size Variant${variants.length === 1 ? "" : "s"} configured for ${product.name}`
              : `${groups.length} Customization Group${groups.length === 1 ? "" : "s"} configured for ${product.name}`}
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow"
          >
            Done
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SUB-MODAL 1: ADD / EDIT SIZE VARIANT (Level 1) */}
        {/* ---------------------------------------------------- */}
        {isVariantModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900">
                  {editingVariantIndex !== null ? "Edit Size Variant Name" : "Add Size / Variant"}
                </h3>
                <button
                  onClick={() => setIsVariantModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSaveVariant} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Variant / Size Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Small, Medium, Large, Regular, Half, Full"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    Enter any custom size name. Small, Medium, Large, Regular, etc.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVariantModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    {editingVariantIndex !== null ? "Save Size Variant" : "Create Size Variant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUB-MODAL 2: ADD / EDIT ITEM INSIDE VARIANT (Level 2) */}
        {/* ---------------------------------------------------- */}
        {isVarItemModalOpen && targetVariantIndexForItem !== null && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    {editingVarItemIndex !== null ? "Edit Item inside Size" : "Add Item / Product inside Size"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Size: {variants[targetVariantIndexForItem]?.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsVarItemModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSaveVarItem} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pizza, Garlic Bread, Cold Drink"
                    value={varItemName}
                    onChange={(e) => setVarItemName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Short Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Slices, 250ml Bottle, Freshly Baked"
                    value={varItemDescription}
                    onChange={(e) => setVarItemDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVarItemModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    {editingVarItemIndex !== null ? "Save Item" : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUB-MODAL 3: ADD / EDIT OPTION INSIDE ITEM (Level 3) */}
        {/* ---------------------------------------------------- */}
        {isVarOptionModalOpen &&
          targetVariantIndexForOption !== null &&
          targetItemIndexForOption !== null && (
            <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900">
                      {editingVarOptionIndex !== null ? "Edit Option" : "Add Option to Item"}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Size: {variants[targetVariantIndexForOption]?.name} → Item:{" "}
                      {(variants[targetVariantIndexForOption]?.items || [])[targetItemIndexForOption]?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsVarOptionModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form onSubmit={handleSaveVarOption} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Option Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Extra Cheese, Ketchup, Coke, Sprite"
                      value={varOptionName}
                      onChange={(e) => setVarOptionName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Additional Price (₹) <span className="text-slate-400 font-normal">(0 for free / included)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="20"
                      value={varOptionPrice}
                      onChange={(e) => setVarOptionPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVarOptionModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                    >
                      {editingVarOptionIndex !== null ? "Save Option" : "Add Option"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        {/* ---------------------------------------------------- */}
        {/* SUB-MODAL 4: ADD / EDIT STANDARD CUSTOMIZATION GROUP */}
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
        {/* SUB-MODAL 5: ADD / EDIT STANDARD OPTION */}
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
