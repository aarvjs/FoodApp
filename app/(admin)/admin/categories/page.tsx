"use client";

import React, { useState } from "react";
import { Layers, Plus, X, Upload, Trash2, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Category } from "@/types";

export default function SuperAdminCategoriesPage() {
  const categories = useStore((state) => state.categories);
  const restaurants = useStore((state) => state.restaurants);
  const addCategory = useStore((state) => state.addCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addCategory({
        name,
        categoryName: name,
        restaurantId: restaurants[0]?.id || "",
        imageFile: imageFile || undefined,
        status: "ACTIVE"
      });

      setName("");
      setImageFile(null);
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Failed to save category: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" /> Menu Categories
          </h1>
          <p className="text-xs text-slate-500">Global food classification stored in Cloud Firestore</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Categories Created</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add food categories with custom icons or uploaded images to categorize your menu items.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Add First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  <img src={c.image} alt={c.name || c.categoryName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name || c.categoryName}</h3>
                  <p className="text-[11px] text-slate-500">{c.itemCount || 0} Items • <span className="text-emerald-600 font-semibold">{c.status || "ACTIVE"}</span></p>
                </div>
              </div>
              <button
                onClick={() => deleteCategory(c.id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Menu Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Desserts & Beverages"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" /> Category Image (Firebase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
