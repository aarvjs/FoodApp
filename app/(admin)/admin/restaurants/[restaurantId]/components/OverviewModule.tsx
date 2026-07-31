"use client";

import React, { useState } from "react";
import { Upload, Loader2, Save, MapPin, Clock, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { RestaurantModel } from "@/models/restaurant";
import { restaurantRepository } from "@/repositories/restaurantRepository";
import { storageService } from "@/services/storageService";
import { Toast } from "@/components/ui/Toast";

interface OverviewModuleProps {
  restaurant: RestaurantModel;
  onRefresh: () => void;
}

export function OverviewModule({ restaurant, onRefresh }: OverviewModuleProps) {
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: restaurant.name || "",
    description: restaurant.description || "",
    ownerName: restaurant.ownerName || "",
    phone: restaurant.phone || "",
    email: restaurant.email || "",
    gstNumber: restaurant.gstNumber || "",
    openingTime: restaurant.openingTime || "10:00 AM",
    closingTime: restaurant.closingTime || "11:00 PM",
    deliveryCharges: restaurant.deliveryCharges || 40,
    minimumOrder: restaurant.minimumOrder || 199,
    status: restaurant.status || "ACTIVE",
    hasDelivery: restaurant.hasDelivery ?? true,
    hasTakeaway: restaurant.hasTakeaway ?? true,
    hasDineIn: restaurant.hasDineIn ?? true,
    hasTableService: restaurant.hasTableService ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let logoUrl = restaurant.logo;
      let bannerUrl = restaurant.banner;

      if (logoFile) {
        logoUrl = await storageService.uploadImage(logoFile, "restaurant_logos");
      }
      if (bannerFile) {
        bannerUrl = await storageService.uploadImage(bannerFile, "restaurant_banners");
      }

      await restaurantRepository.update(restaurant.id, {
        ...formData,
        logo: logoUrl,
        banner: bannerUrl
      });

      setToastMessage("Restaurant information updated successfully!");
      onRefresh();
    } catch (err: any) {
      alert("Failed to update restaurant: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Restaurant Information & Assets</h3>
            <p className="text-xs text-slate-500">Edit business details, contact info & branding images</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Information
          </button>
        </div>

        {/* Banner & Logo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-emerald-600" /> Restaurant Logo
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                <img src={logoFile ? URL.createObjectURL(logoFile) : restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-emerald-600" /> Cover Banner Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-24 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                <img src={bannerFile ? URL.createObjectURL(bannerFile) : restaurant.banner} alt="Banner" className="w-full h-full object-cover" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Restaurant Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Opening Time</label>
            <input
              type="text"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Closing Time</label>
            <input
              type="text"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </form>
    </div>
  );
}
