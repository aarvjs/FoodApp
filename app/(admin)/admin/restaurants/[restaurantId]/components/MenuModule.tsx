"use client";

import React, { useState } from "react";
import { UtensilsCrossed, Plus, Trash2, Edit3, X, Upload, Loader2, Star, Flame, Check, Search, Eye } from "lucide-react";
import { MenuItemModel, ProductCustomizationModel } from "@/models/menuItem";
import { BranchModel } from "@/models/branch";
import { CategoryModel } from "@/models/category";
import { menuRepository } from "@/repositories/menuRepository";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useStore } from "@/lib/store/useStore";
import { ComboManagementTab } from "@/components/combos/ComboManagementTab";
import { CustomizationTab } from "@/components/customization/CustomizationTab";
import { Package, Sliders } from "lucide-react";

interface MenuModuleProps {
  restaurantId: string;
  branches: BranchModel[];
  categories: CategoryModel[];
  menuItems: MenuItemModel[];
  onRefresh: () => void;
  initialTab?: "products" | "combos" | "customization";
}

export function MenuModule({ restaurantId, branches, categories, menuItems, onRefresh, initialTab = "products" }: MenuModuleProps) {
  const storeProducts = useStore((state) => state.products);
  const combos = useStore((state) => state.combos);
  const customizationGroups = useStore((state) => state.customizationGroups);

  const addCombo = useStore((state) => state.addCombo);
  const updateCombo = useStore((state) => state.updateCombo);
  const deleteCombo = useStore((state) => state.deleteCombo);
  const toggleComboAvailability = useStore((state) => state.toggleComboAvailability);

  const addCustomizationGroup = useStore((state) => state.addCustomizationGroup);
  const updateCustomizationGroup = useStore((state) => state.updateCustomizationGroup);
  const deleteCustomizationGroup = useStore((state) => state.deleteCustomizationGroup);

  const [activeTab, setActiveTab] = useState<"products" | "combos" | "customization">(initialTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    branchId: branches[0]?.id || "",
    categoryId: categories[0]?.id || "",
    categoryName: categories[0]?.name || "Main Course",
    name: "",
    description: "",
    fullDescription: "",
    price: 299,
    offerPrice: 249,
    foodType: "Veg" as "Veg" | "Non Veg" | "Egg",
    prepTimeMinutes: 20,
    stock: 50,
    stockStatus: "IN_STOCK" as "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK",
    bestseller: false,
    recommended: false,
    featured: false,
    spicyLevel: "Medium" as "Mild" | "Medium" | "Hot" | "Extra Spicy",
    ingredients: "Spices, Olive Oil, Herbs",
    customTags: "Chef Special",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  const [customizationsList, setCustomizationsList] = useState<ProductCustomizationModel[]>([
    { id: "cust-1", name: "Extra Cheese", price: 30, isAvailable: true },
    { id: "cust-2", name: "Extra Patty", price: 45, isAvailable: true }
  ]);

  const restCombos = combos.filter((c) => c.restaurantId === restaurantId || !c.restaurantId);
  const restCustomizationGroups = customizationGroups.filter((g) => g.restaurantId === restaurantId || !g.restaurantId);
  const availableProductsList = storeProducts.length > 0 ? storeProducts : (menuItems as any);

  const handleOpenModal = (item?: MenuItemModel) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        branchId: item.branchId || branches[0]?.id || "",
        categoryId: item.categoryId || categories[0]?.id || "",
        categoryName: item.categoryName || categories[0]?.name || "Main Course",
        name: item.name || "",
        description: item.description || "",
        fullDescription: item.fullDescription || item.description || "",
        price: item.price || 0,
        offerPrice: item.offerPrice || item.discountPrice || 0,
        foodType: item.foodType || (item.isVeg ? "Veg" : "Non Veg"),
        prepTimeMinutes: item.prepTimeMinutes || 20,
        stock: item.stock || 50,
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
        branchId: branches[0]?.id || "",
        categoryId: categories[0]?.id || "",
        categoryName: categories[0]?.name || "Main Course",
        name: "",
        description: "",
        fullDescription: "",
        price: 299,
        offerPrice: 249,
        foodType: "Veg",
        prepTimeMinutes: 20,
        stock: 50,
        stockStatus: "IN_STOCK",
        bestseller: false,
        recommended: false,
        featured: false,
        spicyLevel: "Medium",
        ingredients: "Spices, Olive Oil, Herbs",
        customTags: "Chef Special",
        status: "ACTIVE"
      });
      setCustomizationsList([
        { id: "cust-1", name: "Extra Cheese", price: 30, isAvailable: true },
        { id: "cust-2", name: "Extra Patty", price: 45, isAvailable: true }
      ]);
    }
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setIsModalOpen(true);
  };

  const handleAddCustomization = () => {
    setCustomizationsList([
      ...customizationsList,
      { id: "cust-" + Date.now(), name: "Extra Sauce", price: 15, isAvailable: true }
    ]);
  };

  const handleRemoveCustomization = (id: string) => {
    setCustomizationsList(customizationsList.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedCat = categories.find((c) => c.id === formData.categoryId);
      const catName = selectedCat ? selectedCat.name : formData.categoryName;

      const payload = {
        restaurantId,
        branchId: formData.branchId || branches[0]?.id || "", // STRICT MANDATORY OWNERSHIP
        categoryId: formData.categoryId,
        categoryName: catName,
        name: formData.name,
        description: formData.description,
        fullDescription: formData.fullDescription,
        price: Number(formData.price),
        discountPrice: Number(formData.offerPrice),
        offerPrice: Number(formData.offerPrice),
        foodType: formData.foodType,
        isVeg: formData.foodType === "Veg",
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        stock: Number(formData.stock),
        stockStatus: formData.stockStatus,
        bestseller: formData.bestseller,
        recommended: formData.recommended,
        featured: formData.featured,
        spicyLevel: formData.spicyLevel,
        ingredients: formData.ingredients.split(",").map((s) => s.trim()),
        customTags: formData.customTags.split(",").map((s) => s.trim()),
        customizations: customizationsList,
        status: formData.status,
        imageFile: mainImageFile || undefined,
        imageFiles: galleryImageFiles.length > 0 ? galleryImageFiles : undefined
      };

      if (editingItem) {
        await menuRepository.update(editingItem.id, payload);
        setToastMessage("Food item updated!");
      } else {
        await menuRepository.create(payload);
        setToastMessage("Food item added to branch menu!");
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert("Failed to save menu item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;
    setSubmitting(true);
    try {
      await menuRepository.delete(deletingItemId);
      setToastMessage("Food item deleted.");
      setDeletingItemId(null);
      onRefresh();
    } catch (err: any) {
      alert("Failed to delete item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter(m => 
    searchQuery === "" || m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" /> Restaurant Menu & Customization Builder
          </h2>
          <p className="text-xs text-slate-500">Manage Products, Combos & Customization Options for this Restaurant</p>
        </div>

        {activeTab === "products" && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        )}
      </div>

      {/* 3 Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "products"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" /> Products ({menuItems.length})
        </button>

        <button
          onClick={() => setActiveTab("combos")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "combos"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Package className="w-4 h-4" /> Combos ({restCombos.length})
        </button>

        <button
          onClick={() => setActiveTab("customization")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "customization"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Sliders className="w-4 h-4" /> Customization ({restCustomizationGroups.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "combos" && (
        <ComboManagementTab
          combos={restCombos}
          restaurantId={restaurantId}
          onAddCombo={addCombo}
          onUpdateCombo={updateCombo}
          onDeleteCombo={deleteCombo}
          onToggleAvailability={toggleComboAvailability}
        />
      )}

      {activeTab === "customization" && (
        <CustomizationTab
          groups={restCustomizationGroups}
          products={availableProductsList}
          onAddGroup={addCustomizationGroup}
          onUpdateGroup={updateCustomizationGroup}
          onDeleteGroup={deleteCustomizationGroup}
        />
      )}

      {activeTab === "products" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Food Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Branch ID</th>
              <th className="px-4 py-3">Price (₹)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">{item.categoryName}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{item.branchId}</td>
                <td className="px-4 py-3 font-black text-slate-900">₹{item.offerPrice || item.price}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {item.isAvailable ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => handleOpenModal(item)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingItemId(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Large Food Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? "Edit Food Item" : "Add Food Item to Branch Menu"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="text-slate-900 bg-white">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-900 bg-white font-bold">
                        {c.name || "Category"}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <option value="cat-general" className="text-slate-900 bg-white font-bold">General Category</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Food Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Paneer Butter Masala"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Food Type</label>
                  <select
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value as any })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Veg" className="text-slate-900 bg-white font-bold">Veg</option>
                    <option value="Non Veg" className="text-slate-900 bg-white font-bold">Non Veg</option>
                    <option value="Egg" className="text-slate-900 bg-white font-bold">Egg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Prep Time (Mins)</label>
                  <select
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={10}>10 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                    <option value={45}>45 Mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Rich cottage cheese cooked in creamy tomato gravy..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" /> Main Food Photo (Firebase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Food Item"
        message="Are you sure you want to remove this item from the branch menu?"
        loading={submitting}
      />
    </div>
  );
}
