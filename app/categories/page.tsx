"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Category } from "@/types";
import { Layers, Plus, Trash2, Edit2, Utensils } from "lucide-react";

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Food Category Management
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Organize menu items into visual categories with custom icons & images
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="glass-card rounded-3xl bg-white border border-orange-100/80 p-5 overflow-hidden group shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200/60 shadow-inner">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-0.5">
                  {cat.itemCount} items listed
                </p>
                <div className="mt-2">
                  <Badge variant="success">{cat.status}</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => deleteCategory(cat.id)}
                className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Food Category"
        subtitle="Create a new classification tag for your restaurant menu"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Category Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. South Indian Dosa Special"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Category Image URL
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
