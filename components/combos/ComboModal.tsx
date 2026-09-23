"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Sparkles, Loader2, Clock, Calendar } from "lucide-react";
import { Combo } from "@/types";
import { uploadImage } from "@/services/storageService";
import { useStore } from "@/lib/store/useStore";
import { DaySelector, ALL_DAYS } from "@/components/ui/DaySelector";

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Combo> & { imageFile?: File | string }) => Promise<void>;
  comboToEdit?: Combo | null;
  currentBranchId?: string;
}

export const ComboModal: React.FC<ComboModalProps> = ({
  isOpen,
  onClose,
  onSave,
  comboToEdit,
  currentBranchId
}) => {
  const branches = useStore((state) => state.branches);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetBranchId, setTargetBranchId] = useState<string>("all");
  const [isActive, setIsActive] = useState(true);
  const [availableFrom, setAvailableFrom] = useState<string>("10:00 AM");
  const [availableUntil, setAvailableUntil] = useState<string>("11:00 PM");
  const [availableDays, setAvailableDays] = useState<string[]>(ALL_DAYS);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (comboToEdit) {
      setName(comboToEdit.name || "");
      setDescription(comboToEdit.description || "");
      setIsActive(comboToEdit.isActive ?? comboToEdit.isAvailable ?? true);
      setImagePreview(comboToEdit.image || "");
      const bId = comboToEdit.branchId || (comboToEdit.branchIds && comboToEdit.branchIds[0]) || currentBranchId || "all";
      setTargetBranchId(bId);

      const bOverride = bId !== "all" && comboToEdit.branchAvailability?.[bId] ? comboToEdit.branchAvailability[bId] : null;
      setAvailableFrom(bOverride?.availableFrom || comboToEdit.availableFrom || "10:00 AM");
      setAvailableUntil(bOverride?.availableUntil || comboToEdit.availableUntil || "11:00 PM");
      setAvailableDays(bOverride?.availableDays || comboToEdit.availableDays || ALL_DAYS);
      setStartDate(bOverride?.startDate || comboToEdit.startDate || "");
      setEndDate(bOverride?.endDate || comboToEdit.endDate || "");
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setImagePreview("");
      setTargetBranchId(currentBranchId || "all");
      setAvailableFrom("10:00 AM");
      setAvailableUntil("11:00 PM");
      setAvailableDays(ALL_DAYS);
      setStartDate("");
      setEndDate("");
    }
    setImageFile(null);
    setErrorMessage(null);
  }, [comboToEdit, isOpen, currentBranchId]);

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
      setErrorMessage("Please enter a valid combo name.");
      return;
    }

    if (!imagePreview && !imageFile) {
      setErrorMessage("Please upload a combo image banner.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80";
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "combos");
      }

      await onSave({
        name: name.trim(),
        description: description.trim(),
        isActive: isActive,
        isAvailable: isActive,
        availableFrom: availableFrom || "10:00 AM",
        availableUntil: availableUntil || "11:00 PM",
        availableDays: availableDays,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        image: finalImageUrl,
        branchId: targetBranchId,
        branchIds: targetBranchId === "all" ? ["all"] : [targetBranchId],
        imageFile: imageFile || undefined
      });

      onClose();
    } catch (err: any) {
      setErrorMessage("Failed to save combo: " + err.message);
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
                {comboToEdit ? "Edit Combo" : "Add Combo"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Create a combo category / banner for your restaurant
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* 1. Combo Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Combo Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Buy 1 Get 1 Free, Super Saving Combo, Zingy Pizza Combo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          {/* 2. Target Branch Visibility */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Target Branch Visibility <span className="text-red-500">*</span>
            </label>
            <select
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="all">🌟 All Branches (Global Combo)</option>
              {branches && branches.length > 0 &&
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    📍 {b.name} ({b.location?.city || b.address || b.restaurantName || "Branch Outlet"})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-500">
              {targetBranchId === "all"
                ? "This combo deal will be displayed across ALL branches in the Customer App."
                : "This combo will ONLY be displayed to customers matching this specific branch in the Customer App."}
            </p>
          </div>

          {/* 3. Combo Image / Banner */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Combo Image / Banner <span className="text-red-500">*</span>
            </label>

            {imagePreview ? (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <img
                  src={imagePreview}
                  alt="Combo Banner"
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
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-amber-50/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700">Click to upload combo image</span>
                <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 4. Optional Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Short description of this combo deal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* 5. Active / Inactive Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="block text-xs font-bold text-slate-800">Active Status</span>
              <span className="block text-[11px] text-slate-500">Show this combo to customers in the restaurant menu</span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-amber-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* 6. Main Combo Schedule (Time, Days & Date Range) */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-extrabold text-slate-900">Main Combo Schedule</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Combo Level Control
              </span>
            </div>

            {/* Days of Week Selector */}
            <DaySelector
              selectedDays={availableDays}
              onChange={(days) => setAvailableDays(days)}
              label="Applicable Days of Week *"
            />

            {/* Time Window (Available From - Available Until) */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-200/60">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Start Time (e.g. 10:00 AM)
                </label>
                <input
                  type="text"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="10:00 AM"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  End Time (e.g. 11:00 PM)
                </label>
                <input
                  type="text"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="11:00 PM"
                />
              </div>
            </div>

            {/* Date Range (Start Date - End Date) */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-200/60">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-600" /> Start Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-600" /> End Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
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
                <span>{comboToEdit ? "Save Changes" : "Create Combo"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
