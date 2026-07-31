"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Store, Trash2, Clock, Upload, Loader2, X, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Restaurant } from "@/types";
import { storageService } from "@/services/storageService";

export default function SuperAdminRestaurantsPage() {
  const restaurants = useStore((state) => state.restaurants);
  const addRestaurant = useStore((state) => state.addRestaurant);
  const updateRestaurant = useStore((state) => state.updateRestaurant);
  const deleteRestaurant = useStore((state) => state.deleteRestaurant);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ownerName: "",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
    cuisineType: "North Indian, South Indian, Biryani",
    gstNumber: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    openingTime: "10:00 AM",
    closingTime: "11:00 PM",
    deliveryCharges: 40,
    minimumOrder: 199,
    hasTableService: true,
    hasTakeaway: true,
    hasDelivery: true,
    hasDineIn: true,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalLogo = formData.logo;
      let finalBanner = formData.banner;

      if (logoFile) {
        finalLogo = await storageService.uploadImage(logoFile, "restaurants/logos");
      }
      if (coverFile) {
        finalBanner = await storageService.uploadImage(coverFile, "restaurants/covers");
      }

      await addRestaurant({
        name: formData.name,
        restaurantName: formData.name,
        description: formData.description,
        ownerName: formData.ownerName,
        logo: finalLogo,
        banner: finalBanner,
        coverImage: finalBanner,
        cuisineType: formData.cuisineType.split(",").map((s) => s.trim()),
        gstNumber: formData.gstNumber,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        deliveryCharges: Number(formData.deliveryCharges),
        minimumOrder: Number(formData.minimumOrder),
        hasTableService: formData.hasTableService,
        hasTakeaway: formData.hasTakeaway,
        hasDelivery: formData.hasDelivery,
        hasDineIn: formData.hasDineIn,
        status: formData.status
      });

      setIsModalOpen(false);
      setLogoFile(null);
      setCoverFile(null);
    } catch (err: any) {
      alert("Failed to save restaurant: " + err.message);
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
            <Store className="w-6 h-6 text-emerald-600" /> Manage Restaurants
          </h1>
          <p className="text-xs text-slate-500">Create & manage global restaurant entities in Cloud Firestore</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Restaurant
        </button>
      </div>

      {/* Empty State */}
      {restaurants.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Restaurants Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Create Restaurant" to add your first restaurant entity with logo and cover images saved directly to Firebase.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Create First Restaurant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {restaurants.map((rest, idx) => (
            <div key={rest.id || `rest-${idx}`} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Banner & Logo Header */}
              <div className="h-32 bg-slate-800 relative overflow-hidden">
                <img src={rest.banner || rest.coverImage} alt={rest.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${rest.status === "ACTIVE" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                    {rest.status}
                  </span>
                </div>
                <div className="absolute -bottom-4 left-4 w-16 h-16 rounded-xl border-4 border-white bg-white shadow overflow-hidden">
                  <img src={rest.logo} alt={rest.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="p-5 pt-7 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{rest.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{rest.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-700">
                  {rest.cuisineType?.map((c, i) => (
                    <span key={`${c}-${i}`} className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">GST Number</span>
                    <span className="font-mono text-slate-800">{rest.gstNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Timings</span>
                    <span className="text-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {rest.openingTime} - {rest.closingTime}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Delivery / Min Order</span>
                    <span className="text-slate-800 font-semibold">₹{rest.deliveryCharges} / ₹{rest.minimumOrder}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Contact Phone</span>
                    <span className="text-slate-800">{rest.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                    <span className={rest.hasDelivery ? "text-emerald-700 font-bold" : "line-through text-slate-400"}>Delivery</span>
                    <span className={rest.hasTakeaway ? "text-emerald-700 font-bold" : "line-through text-slate-400"}>Takeaway</span>
                    <span className={rest.hasDineIn ? "text-emerald-700 font-bold" : "line-through text-slate-400"}>Dine In</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/restaurants/${rest.id}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                    >
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteRestaurant(rest.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Restaurant"
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

      {/* Modal for Create Restaurant */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" /> Create New Restaurant Entity
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. Royal Spice Bistro"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. Vikram Singh"
                  />
                </div>
              </div>

              {/* Logo & Cover Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" /> Logo Image (Firebase Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" /> Cover Image (Firebase Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
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
                  placeholder="Authentic South Indian & Tandoori Delights..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Restaurant to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
