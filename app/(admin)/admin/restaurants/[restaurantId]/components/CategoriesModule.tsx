"use client";

import React, { useState } from "react";
import { Layers, Plus, X, Upload, Trash2, Edit3, Loader2 } from "lucide-react";
import { CategoryModel } from "@/models/category";
import { BranchModel } from "@/models/branch";
import { categoryRepository } from "@/repositories/categoryRepository";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { storageService } from "@/services/storageService";

interface CategoriesModuleProps {
  restaurantId: string;
  branches: BranchModel[];
  categories: CategoryModel[];
  onRefresh: () => void;
}

export function CategoriesModule({ restaurantId, branches, categories, onRefresh }: CategoriesModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    branchId: branches[0]?.id || "",
    name: "",
    description: "",
    displayOrder: 1,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  const handleOpenModal = (cat?: CategoryModel) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({
        branchId: cat.branchId || branches[0]?.id || "",
        name: cat.name || "",
        description: cat.description || "",
        displayOrder: cat.displayOrder || 1,
        status: cat.status || "ACTIVE"
      });
    } else {
      setEditingCat(null);
      setFormData({
        branchId: branches[0]?.id || "",
        name: "",
        description: "",
        displayOrder: 1,
        status: "ACTIVE"
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCat) {
        await categoryRepository.update(editingCat.id, {
          name: formData.name,
          description: formData.description,
          displayOrder: Number(formData.displayOrder),
          status: formData.status,
          imageFile: imageFile || undefined
        });
        setToastMessage("Category updated!");
      } else {
        await categoryRepository.create({
          restaurantId,
          branchId: formData.branchId || branches[0]?.id || "",
          name: formData.name,
          description: formData.description,
          displayOrder: Number(formData.displayOrder),
          status: formData.status,
          imageFile: imageFile || undefined
        });
        setToastMessage("Category created successfully!");
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert("Failed to save category: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCatId) return;
    setSubmitting(true);
    try {
      await categoryRepository.delete(deletingCatId);
      setToastMessage("Category deleted.");
      setDeletingCatId(null);
      onRefresh();
    } catch (err: any) {
      alert("Failed to delete category: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> Restaurant Food Categories
          </h2>
          <p className="text-xs text-slate-500">Manage categories, images & display sort order</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <p className="text-[11px] text-slate-500">{c.description || "Category Item"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleOpenModal(c)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => setDeletingCatId(c.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingCat ? "Edit Category" : "Add Food Category"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {!editingCat && branches.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Branch *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="text-slate-900 bg-white">Select Target Branch...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="text-slate-900 bg-white font-bold">
                        {b.name || "Branch"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Starters & Appetizers"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Freshly prepared dishes"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" /> Category Image (Firebase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Food Category"
        message="Are you sure you want to delete this category?"
        loading={submitting}
      />
    </div>
  );
}
