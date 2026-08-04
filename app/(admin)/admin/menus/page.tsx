"use client";

import React, { useState } from "react";
import { UtensilsCrossed, Plus, Trash2, Edit3, X, Upload, Loader2, Star, Flame, Check, Search, Filter } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Product, ProductCustomization } from "@/types";

import { ComboManagementTab } from "@/components/combos/ComboManagementTab";
import { CustomizationTab } from "@/components/customization/CustomizationTab";
import { Sliders, Package } from "lucide-react";

export default function SuperAdminMenusPage() {
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const restaurants = useStore((state) => state.restaurants);
  const branches = useStore((state) => state.branches);
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);

  const combos = useStore((state) => state.combos);
  const customizationGroups = useStore((state) => state.customizationGroups);
  const addCombo = useStore((state) => state.addCombo);
  const updateCombo = useStore((state) => state.updateCombo);
  const deleteCombo = useStore((state) => state.deleteCombo);
  const toggleComboAvailability = useStore((state) => state.toggleComboAvailability);
  const addCustomizationGroup = useStore((state) => state.addCustomizationGroup);
  const updateCustomizationGroup = useStore((state) => state.updateCustomizationGroup);
  const deleteCustomizationGroup = useStore((state) => state.deleteCustomizationGroup);

  const [activeTab, setActiveTab] = useState<"products" | "combos" | "customization">("products");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterFoodType, setFilterFoodType] = useState("ALL");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fullDescription: "",
    category: categories[0]?.name || "Main Course",
    subCategory: "Standard",
    price: 299,
    offerPrice: 249,
    foodType: "Veg" as "Veg" | "Non Veg" | "Egg",
    prepTimeMinutes: 20,
    availableQuantity: 50,
    stockStatus: "IN_STOCK" as "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK",
    bestseller: false,
    recommended: false,
    featured: false,
    spicyLevel: "Medium" as "Mild" | "Medium" | "Hot" | "Extra Spicy",
    ingredients: "Spices, Olive Oil, Herbs",
    customTags: "Chef Special, Popular",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  // Customization Items Form
  const [customizationsList, setCustomizationsList] = useState<ProductCustomization[]>([
    { id: "cust-1", name: "Extra Cheese", price: 30, isAvailable: true },
    { id: "cust-2", name: "Extra Sauce", price: 15, isAvailable: true }
  ]);

  const handleOpenModal = (item?: Product) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || item.title || "",
        description: item.description || "",
        fullDescription: item.fullDescription || item.description || "",
        category: item.category || categories[0]?.name || "Main Course",
        subCategory: item.subCategory || "Standard",
        price: item.price || 0,
        offerPrice: item.offerPrice || item.discountPrice || 0,
        foodType: item.foodType || (item.isVeg ? "Veg" : "Non Veg"),
        prepTimeMinutes: item.prepTimeMinutes || 20,
        availableQuantity: item.availableQuantity || item.stock || 50,
        stockStatus: item.stockStatus || "IN_STOCK",
        bestseller: item.bestseller || false,
        recommended: item.recommended || false,
        featured: item.featured || false,
        spicyLevel: item.spicyLevel || "Medium",
        ingredients: item.ingredients?.join(", ") || "",
        customTags: item.customTags?.join(", ") || "",
        status: item.status || "ACTIVE"
      });
      setCustomizationsList(item.customizations || []);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        fullDescription: "",
        category: categories[0]?.name || "Main Course",
        subCategory: "Standard",
        price: 299,
        offerPrice: 249,
        foodType: "Veg",
        prepTimeMinutes: 20,
        availableQuantity: 50,
        stockStatus: "IN_STOCK",
        bestseller: false,
        recommended: false,
        featured: false,
        spicyLevel: "Medium",
        ingredients: "Spices, Olive Oil, Herbs",
        customTags: "Chef Special, Popular",
        status: "ACTIVE"
      });
      setCustomizationsList([
        { id: "cust-1", name: "Extra Cheese", price: 30, isAvailable: true },
        { id: "cust-2", name: "Extra Patty", price: 45, isAvailable: true }
      ]);
    }
    setImageFile(null);
    setMultipleFiles([]);
    setIsModalOpen(true);
  };

  const handleAddCustomization = () => {
    setCustomizationsList([
      ...customizationsList,
      { id: "cust-" + Date.now(), name: "Cold Drink (250ml)", price: 25, isAvailable: true }
    ]);
  };

  const handleRemoveCustomization = (id: string) => {
    setCustomizationsList(customizationsList.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: Partial<Product> & { imageFile?: File | string; imageFiles?: File[] } = {
        name: formData.name,
        title: formData.name,
        description: formData.description,
        fullDescription: formData.fullDescription,
        category: formData.category,
        subCategory: formData.subCategory,
        price: Number(formData.price),
        discountPrice: Number(formData.offerPrice),
        offerPrice: Number(formData.offerPrice),
        foodType: formData.foodType,
        isVeg: formData.foodType === "Veg",
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        availableQuantity: Number(formData.availableQuantity),
        stock: Number(formData.availableQuantity),
        stockStatus: formData.stockStatus,
        bestseller: formData.bestseller,
        recommended: formData.recommended,
        featured: formData.featured,
        spicyLevel: formData.spicyLevel,
        ingredients: formData.ingredients.split(",").map((s) => s.trim()),
        customTags: formData.customTags.split(",").map((s) => s.trim()),
        customizations: customizationsList,
        status: formData.status,
        imageFile: imageFile || undefined,
        imageFiles: multipleFiles.length > 0 ? multipleFiles : undefined
      };

      if (editingItem) {
        await updateProduct(editingItem.id, payload);
      } else {
        await addProduct(payload);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert("Failed to save menu item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch = searchQuery === "" || (p.name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "ALL" || p.category === filterCategory;
    const matchType = filterFoodType === "ALL" || p.foodType === filterFoodType || (filterFoodType === "Veg" && p.isVeg) || (filterFoodType === "Non Veg" && !p.isVeg);
    return matchSearch && matchCat && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" /> Master Menu & Product Catalog
          </h1>
          <p className="text-xs text-slate-500">Manage Products, Combos, and Customization Groups across restaurants & branches</p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        )}
      </div>

      {/* 3 Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "products"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" /> Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("combos")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "combos"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Package className="w-4 h-4" /> Combos ({combos.length})
        </button>

        <button
          onClick={() => setActiveTab("customization")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "customization"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Sliders className="w-4 h-4" /> Customization ({customizationGroups.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "combos" && (
        <ComboManagementTab
          combos={combos}
          products={products}
          onAddCombo={addCombo}
          onUpdateCombo={updateCombo}
          onDeleteCombo={deleteCombo}
          onToggleAvailability={toggleComboAvailability}
        />
      )}

      {activeTab === "customization" && (
        <CustomizationTab
          groups={customizationGroups}
          products={products}
          onAddGroup={addCustomizationGroup}
          onUpdateGroup={updateCustomizationGroup}
          onDeleteGroup={deleteCustomizationGroup}
        />
      )}

      {activeTab === "products" && (
        <>
          {/* Search & Filter Bar */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Search menu title, description..."
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterFoodType}
                onChange={(e) => setFilterFoodType(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              >
                <option value="ALL">All Food Types</option>
                <option value="Veg">Veg</option>
                <option value="Non Veg">Non Veg</option>
                <option value="Egg">Egg</option>
              </select>
            </div>
          </div>

          {/* Grid of Menu Items */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
              <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Food Items Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Add Food Item" to create food products with multiple photos, food types, and custom add-ons.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Add First Item
              </button>
            </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p, idx) => (
            <div key={p.id || `prod-${idx}`} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-100 relative">
                <img src={p.image} alt={p.name || p.title} className="w-full h-full object-cover" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase text-white ${
                    p.foodType === "Egg" ? "bg-amber-600" : p.isVeg || p.foodType === "Veg" ? "bg-emerald-600" : "bg-rose-600"
                  }`}>
                    {p.foodType || (p.isVeg ? "Veg" : "Non-Veg")}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900/80 text-white rounded-md text-[10px] font-bold">
                    {p.category}
                  </span>
                  {p.bestseller && (
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold rounded-md text-[10px] flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-slate-950" /> Bestseller
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  ⏱ {p.prepTimeMinutes || 20} Mins
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{p.name || p.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>
                </div>

                {/* Customizations tags */}
                {p.customizations && p.customizations.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {p.customizations.slice(0, 3).map((cust, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">
                        +{cust.name} (₹{cust.price})
                      </span>
                    ))}
                    {p.customizations.length > 3 && (
                      <span className="text-slate-400 font-bold">+{p.customizations.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-lg font-black text-slate-900">₹{p.offerPrice || p.discountPrice || p.price}</span>
                    {(p.offerPrice || p.discountPrice) && (p.offerPrice !== p.price) && (
                      <span className="text-xs text-slate-400 line-through ml-1.5">₹{p.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {/* Rich Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? "Edit Food Item" : "Add New Food Item to Master Catalog"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. Gourmet Cheese Burger"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Food Type *</label>
                  <select
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Veg">Veg (Vegetarian)</option>
                    <option value="Non Veg">Non Veg</option>
                    <option value="Egg">Egg</option>
                  </select>
                </div>
              </div>

              {/* Upload Single & Multiple Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" /> Main Image (Firebase Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" /> Additional Gallery Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setMultipleFiles(Array.from(e.target.files || []))}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="text-slate-900 bg-white">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} className="text-slate-900 bg-white font-bold">{c.name}</option>
                    ))}
                    {categories.length === 0 && <option value="Main Course" className="text-slate-900 bg-white font-bold">Main Course</option>}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub Category</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. Chef Special Starters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prep Time (Minutes)</label>
                  <select
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={10}>10 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                    <option value={45}>45 Mins</option>
                    <option value={60}>60 Mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Crispy fried patty with fresh lettuce and secret melted cheese sauce..."
                />
              </div>

              {/* Badges & Toggles */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <label className="block font-bold text-slate-700">Item Badges & Visibility</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.bestseller}
                      onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    Bestseller
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.recommended}
                      onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    Recommended
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.status === "ACTIVE"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "ACTIVE" : "INACTIVE" })}
                      className="rounded text-emerald-600"
                    />
                    Active Menu
                  </label>
                </div>
              </div>

              {/* Item Customizations (Add-ons) */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900">Customization Add-ons (Extra Cheese, Fries, Patty, Drinks)</label>
                  <button
                    type="button"
                    onClick={handleAddCustomization}
                    className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {customizationsList.map((cust, i) => (
                    <div key={cust.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={cust.name}
                        onChange={(e) => {
                          const copy = [...customizationsList];
                          copy[i].name = e.target.value;
                          setCustomizationsList(copy);
                        }}
                        className="col-span-6 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        placeholder="Option Name (e.g. Extra Cheese)"
                      />
                      <input
                        type="number"
                        value={cust.price}
                        onChange={(e) => {
                          const copy = [...customizationsList];
                          copy[i].price = Number(e.target.value);
                          setCustomizationsList(copy);
                        }}
                        className="col-span-4 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        placeholder="Price ₹"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomization(cust.id)}
                        className="col-span-2 p-2 text-rose-500 hover:bg-rose-100 rounded-lg text-center"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? "Update Food Item" : "Save Food Item to Firestore"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
