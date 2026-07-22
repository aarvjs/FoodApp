"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Clock,
  Layers,
  Leaf,
} from "lucide-react";

export default function ProductsPage() {
  const {
    products,
    categories,
    toggleProductAvailability,
    updateProductStock,
    addProduct,
    editProduct,
    deleteProduct,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === "ALL" || prod.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Menu & Product Catalog
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage food inventory, prices, offer pricing, & live availability toggles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl bg-white border border-orange-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-stone-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setSelectedCat("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === "ALL"
                ? "bg-[#FF6B35] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-orange-50"
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === c.name
                  ? "bg-[#FF6B35] text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-orange-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="glass-card rounded-3xl bg-white border border-orange-100/80 overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Product Cover Image */}
              <div className="h-44 relative bg-stone-100 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Veg/Non-Veg Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-200/60 text-[10px] font-bold text-stone-800">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      prod.isVeg ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <span>{prod.isVeg ? "Pure Veg" : "Non-Veg"}</span>
                </div>

                {/* Star Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-200/60 text-xs font-extrabold text-stone-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{prod.rating}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {prod.name}
                  </h3>
                </div>

                <p className="text-xs text-stone-500 font-medium line-clamp-2 mb-3">
                  {prod.description}
                </p>

                {/* Category & Prep Time */}
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-3">
                  <span className="bg-orange-50 text-[#FF6B35] px-2.5 py-0.5 rounded-full font-bold">
                    {prod.category}
                  </span>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{prod.prepTimeMinutes} mins</span>
                  </div>
                </div>

                {/* Pricing & Offer */}
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-[#FF6B35]">
                    {formatCurrency(prod.offerPrice || prod.price)}
                  </span>
                  {prod.offerPrice && (
                    <span className="text-xs font-semibold text-stone-400 line-through">
                      {formatCurrency(prod.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Availability Toggle */}
            <div className="p-4 border-t border-stone-100 bg-[#FFFDF8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleProductAvailability(prod.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
                    prod.isAvailable ? "bg-emerald-500" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform block ${
                      prod.isAvailable ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-stone-700">
                  {prod.isAvailable ? "Available" : "Sold Out"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingProduct(prod)}
                  className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-[#FF6B35] flex items-center justify-center transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(prod.id)}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `Edit ${editingProduct.name}` : "Create New Food Product"}
        subtitle="Add dish image, pricing, categories, and prep time"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Food Item Name
            </label>
            <input
              type="text"
              defaultValue={editingProduct?.name || ""}
              required
              placeholder="e.g. Gourmet Butter Chicken Biryani"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category
              </label>
              <select
                defaultValue={editingProduct?.category || "Burgers & Sandwiches"}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                defaultValue={editingProduct?.prepTimeMinutes || 15}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Regular Price (₹)
              </label>
              <input
                type="number"
                defaultValue={editingProduct?.price || 299}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Offer / Discounted Price (₹)
              </label>
              <input
                type="number"
                defaultValue={editingProduct?.offerPrice || ""}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Image URL (Unsplash or CDN)
            </label>
            <input
              type="url"
              defaultValue={editingProduct?.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Short Description & Ingredients
            </label>
            <textarea
              rows={2}
              defaultValue={editingProduct?.description || ""}
              placeholder="Fresh ingredients, spices, and prep details..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
