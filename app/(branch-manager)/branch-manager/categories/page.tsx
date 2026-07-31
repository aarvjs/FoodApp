"use client";

import React, { useState } from "react";
import { Layers, Plus, X, Upload, Trash2, Edit3, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Category } from "@/types";

export default function BranchManagerCategoriesPage() {
  const user = useStore((state) => state.user);
  const categories = useStore((state) => state.categories);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setName(cat.name || cat.categoryName || "");
      setDescription(cat.description || "");
      setDisplayOrder(cat.displayOrder || 1);
    } else {
      setEditingCat(null);
      setName("");
      setDescription("");
      setDisplayOrder(1);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name,
          categoryName: name,
          description,
          displayOrder: Number(displayOrder),
          imageFile: imageFile || undefined
        });
      } else {
        await addCategory({
          name,
          categoryName: name,
          description,
          displayOrder: Number(displayOrder),
          restaurantId: user?.restaurantId || "",
          branchId: user?.branchId || "",
          imageFile: imageFile || undefined,
          status: "ACTIVE"
        });
      }

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
            <Layers className="w-6 h-6 text-amber-600" /> Branch Menu Categories
          </h1>
          <p className="text-xs text-slate-500">Create & manage category classifications for your branch menu</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <p className="text-[11px] text-slate-500">{c.itemCount || 0} Active Items</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleOpenModal(c)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCategory(c.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingCat ? "Edit Category" : "Add Branch Category"}
              </h2>
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
                  placeholder="e.g. Desserts & Shakes"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Sweet treats and beverages"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-amber-600" /> Category Image (Firebase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-900 hover:file:bg-amber-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
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
