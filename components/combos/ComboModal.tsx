"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Sparkles, Loader2, Check } from "lucide-react";
import { Combo } from "@/types";
import { uploadImage } from "@/services/storageService";

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Combo> & { imageFile?: File | string }) => Promise<void>;
  comboToEdit?: Combo | null;
}

export const ComboModal: React.FC<ComboModalProps> = ({
  isOpen,
  onClose,
  onSave,
  comboToEdit
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
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
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setImagePreview("");
    }
    setImageFile(null);
    setErrorMessage(null);
  }, [comboToEdit, isOpen]);

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
        image: finalImageUrl,
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* 2. Combo Image / Banner */}
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

          {/* 3. Optional Description */}
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

          {/* 4. Active / Inactive Status Toggle */}
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

          {/* 5. Footer Actions */}
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
