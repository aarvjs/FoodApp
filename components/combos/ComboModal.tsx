"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Check,
  Package,
  Layers,
  Sparkles,
  HelpCircle,
  IndianRupee,
  Utensils
} from "lucide-react";
import {
  Combo,
  Product,
  ComboItemReference,
  ComboReplacementItem,
  ComboAddonGroup,
  ComboAddonOption,
  AvailabilitySlot
} from "@/types";
import { uploadImage } from "@/services/storageService";

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comboData: Partial<Combo> & { imageFile?: File | string }) => Promise<void>;
  comboToEdit?: Combo | null;
  availableProducts: Product[];
}

export const ComboModal: React.FC<ComboModalProps> = ({
  isOpen,
  onClose,
  onSave,
  comboToEdit,
  availableProducts
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(149);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [availabilitySlot, setAvailabilitySlot] = useState<AvailabilitySlot>("FULL_DAY");
  const [isAvailable, setIsAvailable] = useState(true);

  // Included Items inside Combo
  const [comboItems, setComboItems] = useState<ComboItemReference[]>([]);

  // Optional Add-ons Groups
  const [addonGroups, setAddonGroups] = useState<ComboAddonGroup[]>([
    {
      id: "grp-1",
      title: "Extras & Dips",
      options: [
        { id: "opt-1", name: "Extra Cheese", price: 20, isAvailable: true },
        { id: "opt-2", name: "Extra Patty", price: 40, isAvailable: true },
        { id: "opt-3", name: "Ketchup", price: 0, isAvailable: true }
      ]
    }
  ]);

  useEffect(() => {
    if (comboToEdit) {
      setName(comboToEdit.name || "");
      setDescription(comboToEdit.description || "");
      setPrice(comboToEdit.price || 0);
      setDiscountPrice(comboToEdit.discountPrice || 0);
      setAvailabilitySlot(comboToEdit.availabilitySlot || "FULL_DAY");
      setIsAvailable(comboToEdit.isAvailable ?? true);
      setImagePreview(comboToEdit.image || "");
      setComboItems(comboToEdit.items || []);
      setAddonGroups(comboToEdit.addonGroups || []);
    } else {
      setName("");
      setDescription("");
      setPrice(149);
      setDiscountPrice(0);
      setAvailabilitySlot("FULL_DAY");
      setIsAvailable(true);
      setImagePreview("");

      // Default sample selection if products exist
      if (availableProducts.length > 0) {
        const defaultSelected = availableProducts.slice(0, 3).map((p, idx) => ({
          productId: p.id,
          productName: p.name || p.title || "Product",
          productImage: p.image,
          productPrice: p.price,
          defaultQuantity: 1,
          canRemove: idx !== 0, // Main item like burger not removable, sides removable
          priceDeductionOnRemoval: 0,
          allowedReplacements: []
        }));
        setComboItems(defaultSelected);
      } else {
        setComboItems([]);
      }

      setAddonGroups([
        {
          id: "grp-1",
          title: "Extras & Dips",
          options: [
            { id: "opt-1", name: "Extra Cheese", price: 20, isAvailable: true },
            { id: "opt-2", name: "Extra Patty", price: 40, isAvailable: true },
            { id: "opt-3", name: "Ketchup", price: 0, isAvailable: true }
          ]
        }
      ]);
    }
    setImageFile(null);
  }, [comboToEdit, isOpen, availableProducts]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Item Management inside Combo
  const handleAddProductToCombo = (productId: string) => {
    const p = availableProducts.find((item) => item.id === productId);
    if (!p) return;
    if (comboItems.some((ci) => ci.productId === p.id)) return;

    setComboItems([
      ...comboItems,
      {
        productId: p.id,
        productName: p.name || p.title || "Item",
        productImage: p.image,
        productPrice: p.price,
        defaultQuantity: 1,
        canRemove: false,
        priceDeductionOnRemoval: 0,
        allowedReplacements: []
      }
    ]);
  };

  const handleRemoveProductFromCombo = (index: number) => {
    setComboItems(comboItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateComboItem = (index: number, field: keyof ComboItemReference, value: any) => {
    const updated = [...comboItems];
    updated[index] = { ...updated[index], [field]: value };
    setComboItems(updated);
  };

  // Replacement Items Management
  const handleAddReplacement = (itemIndex: number, replacementProductId: string) => {
    const p = availableProducts.find((prod) => prod.id === replacementProductId);
    if (!p) return;

    const currentItem = comboItems[itemIndex];
    const existing = currentItem.allowedReplacements || [];
    if (existing.some((r) => r.productId === p.id)) return;

    const updatedReplacements: ComboReplacementItem[] = [
      ...existing,
      {
        productId: p.id,
        productName: p.name || p.title || "Replacement",
        productImage: p.image,
        extraPrice: 0 // Manager configures price difference
      }
    ];

    handleUpdateComboItem(itemIndex, "allowedReplacements", updatedReplacements);
  };

  const handleRemoveReplacement = (itemIndex: number, rProductId: string) => {
    const currentItem = comboItems[itemIndex];
    const updated = (currentItem.allowedReplacements || []).filter((r) => r.productId !== rProductId);
    handleUpdateComboItem(itemIndex, "allowedReplacements", updated);
  };

  const handleUpdateReplacementPrice = (itemIndex: number, rProductId: string, extraPrice: number) => {
    const currentItem = comboItems[itemIndex];
    const updated = (currentItem.allowedReplacements || []).map((r) =>
      r.productId === rProductId ? { ...r, extraPrice: Number(extraPrice) || 0 } : r
    );
    handleUpdateComboItem(itemIndex, "allowedReplacements", updated);
  };

  // Add-on Group & Option Management
  const handleAddAddonOption = (groupIndex: number) => {
    const updated = [...addonGroups];
    updated[groupIndex].options.push({
      id: "opt-" + Date.now() + Math.random().toString(36).substring(2, 5),
      name: "New Extra",
      price: 15,
      isAvailable: true
    });
    setAddonGroups(updated);
  };

  const handleRemoveAddonOption = (groupIndex: number, optionId: string) => {
    const updated = [...addonGroups];
    updated[groupIndex].options = updated[groupIndex].options.filter((o) => o.id !== optionId);
    setAddonGroups(updated);
  };

  const handleUpdateAddonOption = (groupIndex: number, optionId: string, field: keyof ComboAddonOption, value: any) => {
    const updated = [...addonGroups];
    updated[groupIndex].options = updated[groupIndex].options.map((o) =>
      o.id === optionId ? { ...o, [field]: value } : o
    );
    setAddonGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a valid combo name.");
      return;
    }
    if (comboItems.length === 0) {
      alert("Please add at least one product inside the combo.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80";
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "combos");
      }

      await onSave({
        name,
        description,
        price: Number(price),
        discountPrice: Number(discountPrice),
        availabilitySlot,
        isAvailable,
        items: comboItems,
        addonGroups,
        image: finalImageUrl,
        imageFile: imageFile || undefined
      });

      onClose();
    } catch (err: any) {
      alert("Failed to save combo: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {comboToEdit ? "Edit Combo Meal" : "Create New Combo Builder"}
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Configure combo base price, included products, customer removal & replacement options, and add-ons.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Basic Info */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Basic Details & Base Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Combo Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Burger Combo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Base Combo Price (₹) * <span className="text-amber-600 text-[11px] font-normal">(Manually Set)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Delicious Burger + Crispy Fries + Ice Cold Drink"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Availability Window</label>
                <select
                  value={availabilitySlot}
                  onChange={(e) => setAvailabilitySlot(e.target.value as AvailabilitySlot)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="FULL_DAY">Full Day (All Day Available)</option>
                  <option value="BREAKFAST">Breakfast Hours</option>
                  <option value="LUNCH">Lunch Hours</option>
                  <option value="DINNER">Dinner Hours</option>
                </select>
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span>Active & Available for Order</span>
                </label>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Combo Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Combo Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Included Products inside Combo */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-600" /> Included Products & Removal/Replacement Config
                </h3>
                <p className="text-xs text-slate-500">
                  Select existing products. Configure whether customer can remove items or replace them with alternative items.
                </p>
              </div>

              {/* Product Selector Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddProductToCombo(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <option value="">+ Add Product to Combo</option>
                {availableProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name || prod.title} (₹{prod.price})
                  </option>
                ))}
              </select>
            </div>

            {comboItems.length === 0 ? (
              <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                No products added to this combo yet. Use the dropdown above to add products.
              </div>
            ) : (
              <div className="space-y-4">
                {comboItems.map((item, idx) => (
                  <div key={item.productId + idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded-md" />
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.productName}</h4>
                          <span className="text-xs text-slate-500">Default Qty: 1</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProductFromCombo(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove Item
                      </button>
                    </div>

                    {/* Customer Removable Configuration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700 block">Can Customer Remove?</span>
                          <span className="text-[11px] text-slate-500">Allow removing before order placement</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.canRemove}
                            onChange={(e) => handleUpdateComboItem(idx, "canRemove", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>

                      {item.canRemove && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <label className="block font-semibold text-slate-700 mb-1">
                            Price Deduction on Removal (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 (No price reduction)"
                            value={item.priceDeductionOnRemoval || 0}
                            onChange={(e) => handleUpdateComboItem(idx, "priceDeductionOnRemoval", Number(e.target.value))}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                          <span className="text-[10px] text-slate-400">Removing item will not deduct price unless set above.</span>
                        </div>
                      )}
                    </div>

                    {/* Replacement Configuration */}
                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-900">Allowed Item Replacements</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddReplacement(idx, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="px-2.5 py-1 bg-white border border-amber-300 rounded text-xs font-semibold text-amber-800 cursor-pointer"
                        >
                          <option value="">+ Allow Alternative Product</option>
                          {availableProducts
                            .filter((p) => p.id !== item.productId)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name || p.title}
                              </option>
                            ))}
                        </select>
                      </div>

                      {(!item.allowedReplacements || item.allowedReplacements.length === 0) ? (
                        <p className="text-[11px] text-amber-700 italic">No replacements configured for this item.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {item.allowedReplacements.map((rep) => (
                            <div key={rep.productId} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-amber-200 text-xs">
                              <span className="font-medium text-slate-800">{rep.productName}</span>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-slate-500">Extra Charge: ₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rep.extraPrice}
                                    onChange={(e) => handleUpdateReplacementPrice(idx, rep.productId, Number(e.target.value))}
                                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-xs font-semibold text-amber-700 text-right"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReplacement(idx, rep.productId)}
                                  className="text-red-500 hover:text-red-700 text-[11px] font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Combo Add-ons Section */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" /> Optional Combo Add-ons (Extras)
                </h3>
                <p className="text-xs text-slate-500">
                  Allow customers to add paid or free optional extras (e.g. Extra Cheese ₹20, Ketchup Free).
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddAddonOption(0)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Extra Option
              </button>
            </div>

            {addonGroups.length > 0 && (
              <div className="space-y-2">
                {addonGroups[0].options.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => handleUpdateAddonOption(0, opt.id, "name", e.target.value)}
                      placeholder="Add-on Name (e.g. Extra Cheese)"
                      className="px-2.5 py-1 border border-slate-300 rounded font-medium text-slate-800 w-1/2"
                    />

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-semibold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={opt.price}
                          onChange={(e) => handleUpdateAddonOption(0, opt.id, "price", Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-slate-300 rounded font-semibold text-amber-700 text-right"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAddonOption(0, opt.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Combo...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Combo Builder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
