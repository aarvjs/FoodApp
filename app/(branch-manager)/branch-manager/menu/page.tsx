"use client";

import React, { useState } from "react";
import { UtensilsCrossed, Plus, Trash2, Edit3, X, Upload, Loader2, Star, Flame, Check, Search, Store, Package, Sliders } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Product, ProductCustomization } from "@/types";
import { ComboManagementTab } from "@/components/combos/ComboManagementTab";
import { CustomizationTab } from "@/components/customization/CustomizationTab";

export default function BranchManagerMenuPage() {
  const user = useStore((state) => state.user);
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFoodType, setFilterFoodType] = useState("ALL");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: categories[0]?.name || "Main Course",
    price: 299,
    offerPrice: 249,
    foodType: "Veg" as "Veg" | "Non Veg" | "Egg",
    prepTimeMinutes: 20,
    availableQuantity: 50,
    stockStatus: "IN_STOCK" as "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK",
    bestseller: false,
    spicyLevel: "Medium" as "Mild" | "Medium" | "Hot" | "Extra Spicy"
  });

  const [customizationsList, setCustomizationsList] = useState<ProductCustomization[]>([
    { id: "cust-1", name: "Extra Cheese", price: 30, isAvailable: true },
    { id: "cust-2", name: "French Fries", price: 60, isAvailable: true }
  ]);

  // Scoped to Manager's Assigned Branch
  const branchProducts = products.filter((p) => {
    if (!user?.branchId) return true;
    if (p.branchId && p.branchId === user.branchId) return true;
    if (p.branchIds && p.branchIds.includes(user.branchId)) return true;
    return true;
  });

  const branchCombos = combos.filter((c) => {
    if (!user?.branchId) return true;
    if (c.branchId && c.branchId === user.branchId) return true;
    if (c.branchIds && c.branchIds.includes(user.branchId)) return true;
    return false;
  });
  const branchCustomizationGroups = customizationGroups.filter((g) => {
    if (!user?.branchId) return true;
    if (g.branchId && g.branchId === user.branchId) return true;
    if (g.branchIds && g.branchIds.includes(user.branchId)) return true;
    return false;
  });

  const filteredProducts = branchProducts.filter((p) => {
    const matchSearch = searchQuery === "" || (p.name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterFoodType === "ALL" || p.foodType === filterFoodType || (filterFoodType === "Veg" && p.isVeg) || (filterFoodType === "Non Veg" && !p.isVeg);
    return matchSearch && matchType;
  });

  const handleOpenModal = (item?: Product) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || item.title || "",
        description: item.description || "",
        category: item.category || categories[0]?.name || "Main Course",
        price: item.price || 0,
        offerPrice: item.offerPrice || item.discountPrice || 0,
        foodType: item.foodType || (item.isVeg ? "Veg" : "Non Veg"),
        prepTimeMinutes: item.prepTimeMinutes || 20,
        availableQuantity: item.availableQuantity || item.stock || 50,
        stockStatus: item.stockStatus || "IN_STOCK",
        bestseller: item.bestseller || false,
        spicyLevel: item.spicyLevel || "Medium"
      });
      setCustomizationsList(item.customizations || []);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        category: categories[0]?.name || "Main Course",
        price: 299,
        offerPrice: 249,
        foodType: "Veg",
        prepTimeMinutes: 20,
        availableQuantity: 50,
        stockStatus: "IN_STOCK",
        bestseller: false,
        spicyLevel: "Medium"
      });
      setCustomizationsList([
        { id: "cust-1", name: "Extra Cheese", price: 30, isAvailable: true },
        { id: "cust-2", name: "French Fries", price: 60, isAvailable: true }
      ]);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: Partial<Product> & { imageFile?: File | string } = {
        name: formData.name,
        title: formData.name,
        description: formData.description,
        category: formData.category,
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
        spicyLevel: formData.spicyLevel,
        customizations: customizationsList,
        branchId: user?.branchId || "",
        branchIds: user?.branchId ? [user.branchId] : [],
        restaurantId: user?.restaurantId || "",
        status: "ACTIVE",
        imageFile: imageFile || undefined
      };

      if (editingItem) {
        await updateProduct(editingItem.id, payload);
      } else {
        await addProduct(payload);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert("Failed to save branch menu item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-amber-600" /> Branch Menu & Kitchen Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage food menu, stock status & item customizations for: <strong>{user?.assignedBranchName || "Assigned Branch"}</strong>
          </p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Branch Menu Item
          </button>
        )}
      </div>

      {/* 3 Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "products"
            ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
        >
          <UtensilsCrossed className="w-4 h-4" /> Products ({branchProducts.length})
        </button>

        <button
          onClick={() => setActiveTab("combos")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "combos"
            ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
        >
          <Package className="w-4 h-4" /> Combos ({branchCombos.length})
        </button>

        <button
          onClick={() => setActiveTab("customization")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "customization"
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
        >
          <Sliders className="w-4 h-4" /> Customization ({branchCustomizationGroups.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "combos" && (
        <ComboManagementTab
          combos={branchCombos}
          restaurantId={user?.restaurantId || ""}
          branchId={user?.branchId}
          branchIds={user?.branchId ? [user.branchId] : []}
          isBranchManager={true}
          onAddCombo={addCombo}
          onUpdateCombo={updateCombo}
          onDeleteCombo={deleteCombo}
        />
      )}

      {activeTab === "customization" && (
        <CustomizationTab
          groups={branchCustomizationGroups}
          products={branchProducts}
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
                placeholder="Search branch menu items..."
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
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

          {/* Branch Menu Items Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Food Items for Branch</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Add Branch Menu Item" to add new food items with images and customizations.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p, idx) => {
                const isItemAvailable = p.isAvailable ?? p.available ?? true;
                return (
                  <div key={p.id || `bprod-${idx}`} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-44 bg-slate-100 relative">
                      <img src={p.image} alt={p.name || p.title} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${p.foodType === "Egg" ? "bg-amber-600" : p.isVeg || p.foodType === "Veg" ? "bg-emerald-600" : "bg-rose-600"
                        }`}>
                        {p.foodType || (p.isVeg ? "Veg" : "Non-Veg")}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{p.name || p.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                        <span className="text-sm font-black text-slate-900 mt-1 block">
                          ₹{p.offerPrice || p.discountPrice || p.price}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => updateProduct(p.id, { isAvailable: !isItemAvailable, available: !isItemAvailable })}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${isItemAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                        >
                          {isItemAvailable ? "In Stock" : "Out of Stock"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Edit Menu Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Delete Menu Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? "Edit Branch Food Item" : "Add Food Item for Branch"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Tandoori Chicken Biryani"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-amber-600" /> Upload Image (Firebase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-900 hover:file:bg-amber-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Food Type</label>
                  <select
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non Veg">Non Veg</option>
                    <option value="Egg">Egg</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="" className="text-slate-900 bg-white">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} className="text-slate-900 bg-white font-bold">{c.name}</option>
                    ))}
                    {categories.length === 0 && <option value="Main Course" className="text-slate-900 bg-white font-bold">Main Course</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Basmati rice dum cooked with aromatic spices..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? "Update Branch Item" : "Save to Branch Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
