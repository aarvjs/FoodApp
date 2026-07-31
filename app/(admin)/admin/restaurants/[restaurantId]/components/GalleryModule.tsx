"use client";

import React, { useState } from "react";
import { Image, Upload, Trash2, Loader2, Plus, Star } from "lucide-react";
import { GalleryItemModel } from "@/models/gallery";
import { BranchModel } from "@/models/branch";
import { galleryRepository } from "@/repositories/galleryRepository";
import { storageService } from "@/services/storageService";
import { Toast } from "@/components/ui/Toast";

interface GalleryModuleProps {
  restaurantId: string;
  branches: BranchModel[];
  gallery: GalleryItemModel[];
  onRefresh: () => void;
}

export function GalleryModule({ restaurantId, branches, gallery, onRefresh }: GalleryModuleProps) {
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [category, setCategory] = useState<"Interior" | "Kitchen" | "Food" | "Events">("Interior");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setSubmitting(true);

    try {
      const url = await storageService.uploadImage(uploadFile, "restaurant_gallery");
      await galleryRepository.create({
        restaurantId,
        branchId: branches[0]?.id || "",
        imageUrl: url,
        title: uploadFile.name,
        category
      });
      setToastMessage("Image uploaded to gallery!");
      setUploadFile(null);
      onRefresh();
    } catch (err: any) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      await galleryRepository.delete(id);
      setToastMessage("Image removed from gallery.");
      onRefresh();
    } catch (err: any) {
      alert("Failed to delete image: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-emerald-600" /> Restaurant Photo Gallery ({gallery.length})
          </h2>
          <p className="text-xs text-slate-500">Upload ambience, kitchen & food photos to Firebase Storage</p>
        </div>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        <div className="flex-1 w-full">
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
        >
          <option value="Interior">Interior</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Food">Food Dishes</option>
          <option value="Events">Events</option>
        </select>
        <button
          type="submit"
          disabled={submitting || !uploadFile}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Photo
        </button>
      </form>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <div key={item.id} className="relative group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-40 bg-slate-100">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5 flex justify-between items-center bg-white border-t border-slate-100">
              <span className="font-bold text-slate-800 text-[11px]">{item.category}</span>
              <button onClick={() => handleDelete(item.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
