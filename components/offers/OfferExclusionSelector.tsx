"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckSquare, Square, AlertTriangle, Package, Layers, RefreshCw } from "lucide-react";
import { menuRepository } from "@/repositories/menuRepository";
import { getCombosByBranch, getComboItems } from "@/services/comboService";
import { MenuItemModel } from "@/models/menuItem";
import { Combo, ComboItem } from "@/types";

interface OfferExclusionSelectorProps {
  branchId: string;
  excludedProductIds: string[];
  excludedComboIds: string[];
  excludedComboProductIds: Record<string, string[]>;
  onChange: (exclusions: {
    excludedProductIds: string[];
    excludedComboIds: string[];
    excludedComboProductIds: Record<string, string[]>;
  }) => void;
}

export function OfferExclusionSelector({
  branchId,
  excludedProductIds = [],
  excludedComboIds = [],
  excludedComboProductIds = {},
  onChange
}: OfferExclusionSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemModel[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [comboItemsMap, setComboItemsMap] = useState<Record<string, ComboItem[]>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!branchId) {
      setMenuItems([]);
      setCombos([]);
      setComboItemsMap({});
      return;
    }

    let isMounted = true;
    setLoading(true);

    const loadBranchData = async () => {
      try {
        const [items, branchCombos] = await Promise.all([
          menuRepository.getByBranch(branchId),
          getCombosByBranch(branchId)
        ]);

        if (!isMounted) return;
        setMenuItems(items || []);
        setCombos(branchCombos || []);

        // Load items for each combo
        const itemsMap: Record<string, ComboItem[]> = {};
        await Promise.all(
          (branchCombos || []).map(async (c) => {
            try {
              const cItems = await getComboItems(c.id);
              itemsMap[c.id] = cItems || [];
            } catch (_) {
              itemsMap[c.id] = [];
            }
          })
        );

        if (isMounted) {
          setComboItemsMap(itemsMap);
        }
      } catch (err) {
        console.error("Error loading exclusion selector data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBranchData();

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  // Handle menu product exclusion toggle
  const toggleProductExclusion = (productId: string) => {
    const isExcluded = excludedProductIds.includes(productId);
    const updated = isExcluded
      ? excludedProductIds.filter((id) => id !== productId)
      : [...excludedProductIds, productId];

    onChange({
      excludedProductIds: updated,
      excludedComboIds,
      excludedComboProductIds
    });
  };

  // Select all visible menu products to exclude
  const selectAllProductsToExclude = () => {
    const visibleIds = filteredMenuItems.map((item) => item.id);
    const combined = Array.from(new Set([...excludedProductIds, ...visibleIds]));
    onChange({
      excludedProductIds: combined,
      excludedComboIds,
      excludedComboProductIds
    });
  };

  // Clear all menu product exclusions
  const clearProductExclusions = () => {
    onChange({
      excludedProductIds: [],
      excludedComboIds,
      excludedComboProductIds
    });
  };

  // Handle entire combo exclusion toggle
  const toggleComboExclusion = (comboId: string) => {
    const isExcluded = excludedComboIds.includes(comboId);
    const updated = isExcluded
      ? excludedComboIds.filter((id) => id !== comboId)
      : [...excludedComboIds, comboId];

    onChange({
      excludedProductIds,
      excludedComboIds: updated,
      excludedComboProductIds
    });
  };

  // Handle partial product exclusion inside a combo
  const toggleComboProductExclusion = (comboId: string, comboItemId: string) => {
    const currentExcluded = excludedComboProductIds[comboId] || [];
    const isExcluded = currentExcluded.includes(comboItemId);
    const updatedList = isExcluded
      ? currentExcluded.filter((id) => id !== comboItemId)
      : [...currentExcluded, comboItemId];

    const updatedMap = {
      ...excludedComboProductIds,
      [comboId]: updatedList
    };

    if (updatedList.length === 0) {
      delete updatedMap[comboId];
    }

    onChange({
      excludedProductIds,
      excludedComboIds,
      excludedComboProductIds: updatedMap
    });
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const catName = item.categoryName || (item as any).category || "";
    return (
      item.name.toLowerCase().includes(term) ||
      catName.toLowerCase().includes(term)
    );
  });

  if (!branchId) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span>Please select a branch first to configure product & combo exclusions.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading branch menu items & combos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
      {/* SECTION HEADER */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span>Offer Exclusions System</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Select products or combos that must <span className="font-semibold text-rose-600">NOT</span> receive this offer. Unselected items remain <span className="font-semibold text-emerald-600">ELIGIBLE</span>.
        </p>
      </div>

      {/* 1. MENU PRODUCTS EXCLUSION SECTION */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-sm text-slate-800">Menu Products Exclusion</span>
            <span className="text-xs bg-rose-100 text-rose-700 font-medium px-2 py-0.5 rounded-full">
              {excludedProductIds.length} Excluded
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAllProductsToExclude}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition font-medium"
            >
              Exclude All Visible
            </button>
            <button
              type="button"
              onClick={clearProductExclusions}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition font-medium"
            >
              Clear Exclusions
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search menu products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Product Cards Grid */}
        {filteredMenuItems.length === 0 ? (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            No menu products found for this branch.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredMenuItems.map((item) => {
              const isExcluded = excludedProductIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleProductExclusion(item.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isExcluded
                      ? "bg-rose-50 border-rose-300 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-9 h-9 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400 font-bold text-xs">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                        <span>₹{item.price}</span>
                        {(item.categoryName || (item as any).category) && (
                          <span>• {item.categoryName || (item as any).category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isExcluded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                        <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                        EXCLUDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                        ELIGIBLE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. COMBOS EXCLUSION SECTION */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-sm text-slate-800">Combo Deals Exclusion</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
              {excludedComboIds.length} Combos Excluded
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          You can exclude an entire combo, or expand it to exclude specific products inside that combo.
        </p>

        {combos.length === 0 ? (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            No combo deals found for this branch.
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {combos.map((combo) => {
              const isComboExcluded = excludedComboIds.includes(combo.id);
              const comboItems = comboItemsMap[combo.id] || [];
              const excludedComboProds = excludedComboProductIds[combo.id] || [];

              return (
                <div
                  key={combo.id}
                  className={`rounded-2xl border transition overflow-hidden ${
                    isComboExcluded
                      ? "bg-rose-50/70 border-rose-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {/* Combo Main Card Header */}
                  <div
                    onClick={() => toggleComboExclusion(combo.id)}
                    className="p-3 cursor-pointer flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {combo.image ? (
                        <img
                          src={combo.image}
                          alt={combo.name}
                          className="w-10 h-10 object-cover rounded-xl flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">
                          COMBO
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {combo.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {combo.description || `${comboItems.length} products included`}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isComboExcluded ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-300">
                          <CheckSquare className="w-4 h-4 text-rose-600" />
                          ENTIRE COMBO EXCLUDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Square className="w-4 h-4 text-slate-400" />
                          COMBO ELIGIBLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Partial Products Inside Combo */}
                  {comboItems.length > 0 && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                        <span>Products inside this combo:</span>
                        {isComboExcluded && (
                          <span className="text-[10px] text-rose-600 font-normal">
                            (Disabled because entire combo is excluded)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {comboItems.map((cItem) => {
                          const isItemExcluded =
                            isComboExcluded || excludedComboProds.includes(cItem.id);

                          return (
                            <div
                              key={cItem.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isComboExcluded) {
                                  toggleComboProductExclusion(combo.id, cItem.id);
                                }
                              }}
                              className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                                isComboExcluded
                                  ? "bg-rose-100/50 border-rose-200 opacity-70 cursor-not-allowed"
                                  : isItemExcluded
                                  ? "bg-rose-50 border-rose-300 cursor-pointer"
                                  : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="font-medium text-slate-800 truncate block">
                                  {cItem.name}
                                </span>
                                {cItem.price > 0 && (
                                  <span className="text-[10px] text-slate-500">₹{cItem.price}</span>
                                )}
                              </div>

                              <div className="flex-shrink-0">
                                {isItemExcluded ? (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                    <CheckSquare className="w-3 h-3 text-rose-600" />
                                    EXCLUDED
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                    <Square className="w-3 h-3 text-slate-400" />
                                    ELIGIBLE
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
