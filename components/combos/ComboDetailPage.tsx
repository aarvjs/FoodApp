"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit3, Trash2, Package, Sparkles, Star, Sliders, Layers } from "lucide-react";
import { Combo, ComboItem, CustomizationGroup } from "@/types";
import {
  subscribeToComboItems,
  addComboItem,
  updateComboItem,
  deleteComboItem,
  toggleAvailability
} from "@/services/comboService";
import { ComboItemModal } from "./ComboItemModal";
import { ComboProductCustomizationModal } from "./ComboProductCustomizationModal";

interface ComboDetailPageProps {
  combo: Combo;
  onBack: () => void;
  restaurantId: string;
  branchId?: string;
  branchIds?: string[];
}

export const ComboDetailPage: React.FC<ComboDetailPageProps> = ({
  combo,
  onBack,
  restaurantId,
  branchId,
  branchIds
}) => {
  const [items, setItems] = useState<ComboItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComboItem | null>(null);

  // Active status state
  const [isComboActive, setIsComboActive] = useState<boolean>(combo.isActive ?? combo.isAvailable ?? true);

  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState<ComboItem | null>(null);

  useEffect(() => {
    setIsComboActive(combo.isActive ?? combo.isAvailable ?? true);
  }, [combo.isActive, combo.isAvailable]);

  const handleToggleActive = async () => {
    const nextState = !isComboActive;
    setIsComboActive(nextState);
    try {
      await toggleAvailability(combo.id, nextState);
    } catch (err) {
      console.error("Failed to toggle combo availability:", err);
      setIsComboActive(!nextState);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToComboItems(
      combo.id,
      (fetchedItems) => {
        setItems(fetchedItems);
        setLoading(false);
        // Refresh customizing item if currently open
        if (customizingItem) {
          const fresh = fetchedItems.find((i) => i.id === customizingItem.id);
          if (fresh) setCustomizingItem(fresh);
        }
      },
      (err) => {
        console.warn("Error streaming combo items:", err);
        setLoading(false);
      }
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [combo.id]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: ComboItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (data: Partial<ComboItem> & { imageFile?: File | string }) => {
    if (editingItem) {
      await updateComboItem(editingItem.id, data);
    } else {
      await addComboItem({
        ...data,
        comboId: combo.id,
        restaurantId: combo.restaurantId || restaurantId,
        branchId: combo.branchId || branchId,
        branchIds: combo.branchIds || branchIds
      });
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}" from this combo?`)) {
      await deleteComboItem(itemId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Combo Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={combo.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80"}
            alt={combo.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-extrabold rounded-xl shadow-lg backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Combos</span>
            </button>
          </div>

          {/* Title and Meta */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-white space-y-1">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500 rounded-full text-white inline-block">
                Combo Category
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">{combo.name}</h1>
              {combo.description ? (
                <p className="text-xs text-slate-200 font-medium max-w-xl line-clamp-2">
                  {combo.description}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Active / Inactive Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleActive}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-lg backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border ${
                  isComboActive
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/40"
                    : "bg-slate-800 hover:bg-slate-900 text-slate-200 border-slate-600/50"
                }`}
                title={`Click to turn ${isComboActive ? "OFF (INACTIVE)" : "ON (ACTIVE)"}`}
              >
                <span>{isComboActive ? "ACTIVE (ON)" : "INACTIVE (OFF)"}</span>
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isComboActive ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isComboActive ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Combo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub Header Info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Products / Items in this Combo ({items.length})</span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
            These items belong strictly to this combo and will not appear in the normal menu.
          </span>
        </div>
      </div>

      {/* Items Section */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-500">
          Loading items for this combo...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Items Added Yet</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Click "+ Add Item to Combo" to manually create items (e.g. Farmer's Market Pizza, Corn Cheese & Jalapenos) for "{combo.name}".
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const customGroupsCount = item.customizationGroups?.length || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Image and badges */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-md shadow-sm ${
                          item.isVeg
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {item.isVeg ? "VEG" : "NON-VEG"}
                      </span>
                      {item.isCustomisable || customGroupsCount > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-blue-600 text-white rounded-md shadow-sm">
                          CUSTOMISABLE
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h4>
                    {item.description ? (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  {/* Customization Groups summary */}
                  {customGroupsCount > 0 && (
                    <div className="p-2.5 bg-blue-50/80 border border-blue-100 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10.5px] font-bold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-blue-600" />
                          Customization Groups ({customGroupsCount})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.customizationGroups?.map((g) => (
                          <span
                            key={g.id}
                            className="px-2 py-0.5 bg-white border border-blue-200 text-blue-800 text-[9.5px] font-bold rounded-md"
                          >
                            {g.title} ({g.options?.length || 0})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-amber-600">
                        ₹{item.price}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          ₹{item.originalPrice}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{item.rating || 4.2}</span>
                      <span className="text-[10px] text-amber-500">({item.ratingCount || 569})</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Manage Customization Button */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => setCustomizingItem(item)}
                    className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Manage Customization ({customGroupsCount})</span>
                  </button>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Combo Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Item Creation Modal */}
      {isItemModalOpen && (
        <ComboItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          comboId={combo.id}
          restaurantId={combo.restaurantId || restaurantId}
          branchId={combo.branchId || branchId}
          branchIds={combo.branchIds || branchIds}
          onSave={handleSaveItem}
          itemToEdit={editingItem}
        />
      )}

      {/* Dedicated Customization Group & Options Manager Modal */}
      {customizingItem && (
        <ComboProductCustomizationModal
          isOpen={!!customizingItem}
          onClose={() => setCustomizingItem(null)}
          product={customizingItem}
          comboName={combo.name}
          onSaved={(latestGroups) => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === customizingItem.id
                  ? { ...i, customizationGroups: latestGroups, isCustomisable: latestGroups.length > 0 }
                  : i
              )
            );
          }}
        />
      )}
    </div>
  );
};
