"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Sparkles, Loader2 } from "lucide-react";
import { ComboItem } from "@/types";
import { uploadImage } from "@/services/storageService";

interface ComboItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  comboId: string;
  restaurantId: string;
  branchId?: string;
  branchIds?: string[];
  onSave: (data: Partial<ComboItem> & { imageFile?: File | string }) => Promise<void>;
  itemToEdit?: ComboItem | null;
}

export const ComboItemModal: React.FC<ComboItemModalProps> = ({
  isOpen,
  onClose,
  comboId,
  restaurantId,
  branchId,
  branchIds,
  onSave,
  itemToEdit
}) => {
  const [name, setName] = useState("");
  const [foodType, setFoodType] = useState<"Veg" | "Non Veg">("Veg");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("399");
  const [originalPrice, setOriginalPrice] = useState<string>("750");
  const [rating, setRating] = useState<string>("4.2");
  const [ratingCount, setRatingCount] = useState<string>("569");
  const [isCustomisable, setIsCustomisable] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || "");
      setFoodType(itemToEdit.foodType || (itemToEdit.isVeg ? "Veg" : "Non Veg"));
      setDescription(itemToEdit.description || "");
      setPrice(itemToEdit.price !== undefined ? itemToEdit.price.toString() : "399");
      setOriginalPrice(itemToEdit.originalPrice !== undefined ? itemToEdit.originalPrice.toString() : "750");
      setRating(itemToEdit.rating !== undefined ? itemToEdit.rating.toString() : "4.2");
      setRatingCount(itemToEdit.ratingCount !== undefined ? itemToEdit.ratingCount.toString() : "569");
      setIsCustomisable(itemToEdit.isCustomisable ?? true);
      setImagePreview(itemToEdit.image || "");
    } else {
      setName("");
      setFoodType("Veg");
      setDescription("Onion | Capsicum | Mozzarella Cheese");
      setPrice("399");
      setOriginalPrice("750");
      setRating("4.2");
      setRatingCount("569");
      setIsCustomisable(true);
      setImagePreview("");
    }
    setImageFile(null);
    setErrorMessage(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a valid item name.");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage("Please enter a valid non-negative display price.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80";
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "comboItems");
      }

      const numOriginal = originalPrice.trim() !== "" ? Number(originalPrice) : undefined;
      const numRating = rating.trim() !== "" ? Number(rating) : 4.2;
      const numRatingCount = ratingCount.trim() !== "" ? Number(ratingCount) : 569;

      await onSave({
        comboId,
        restaurantId,
        branchId,
        branchIds,
        name: name.trim(),
        foodType,
        isVeg: foodType === "Veg",
        description: description.trim(),
        price: numPrice,
        originalPrice: numOriginal,
        rating: numRating,
        ratingCount: numRatingCount,
        isCustomisable,
        image: finalImageUrl,
        imageFile: imageFile || undefined
      });

      onClose();
    } catch (err: any) {
      setErrorMessage("Failed to save combo item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {itemToEdit ? "Edit Combo Item" : "Add Combo Item"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Manually create an item specifically for this combo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* 1. Item Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Farmer's Market Pizza, Corn Cheese & Jalapenos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          {/* 2. Food Type (Veg / Non Veg) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Food Type (Category)
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFoodType("Veg")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                  foodType === "Veg"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Veg
              </button>

              <button
                type="button"
                onClick={() => setFoodType("Non Veg")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                  foodType === "Non Veg"
                    ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Non Veg
              </button>
            </div>
          </div>

          {/* 3. Short Description / Ingredients */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Short Description / Summary Line
            </label>
            <input
              type="text"
              placeholder="e.g. Onion | Capsicum | Mozzarella Cheese"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          {/* 4. Display Price & Original Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Display Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="399"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Original Price (₹) <span className="text-slate-400 font-normal">(Strikethrough)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="750"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* 5. Rating & Rating Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Rating <span className="text-slate-400 font-normal">(e.g. 4.2)</span>
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                placeholder="4.2"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Rating Count <span className="text-slate-400 font-normal">(e.g. 569)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="569"
                value={ratingCount}
                onChange={(e) => setRatingCount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* 6. Customisable Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="block text-xs font-bold text-slate-800">Customisable Tag</span>
              <span className="block text-[11px] text-slate-500">Show "CUSTOMISABLE" badge below the add button</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomisable(!isCustomisable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isCustomisable ? "bg-amber-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isCustomisable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* 7. Item Image */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Item Image
            </label>

            {imagePreview ? (
              <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <img
                  src={imagePreview}
                  alt="Item Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-lg transition-transform hover:scale-105">
                    <span>Replace Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-amber-50/20 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5 shadow-inner">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Click to upload item image</span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{itemToEdit ? "Update Item" : "Save Item"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
