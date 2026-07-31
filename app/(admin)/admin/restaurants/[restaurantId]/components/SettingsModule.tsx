"use client";

import React, { useState } from "react";
import { Settings, Save, Trash2, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { RestaurantModel } from "@/models/restaurant";
import { restaurantRepository } from "@/repositories/restaurantRepository";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

interface SettingsModuleProps {
  restaurant: RestaurantModel;
  onRefresh: () => void;
}

export function SettingsModule({ restaurant, onRefresh }: SettingsModuleProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    gstNumber: restaurant.gstNumber || "09ABCDE1234F1Z5",
    taxPercentage: 5,
    packagingCharge: 15,
    deliveryCharges: restaurant.deliveryCharges || 40,
    minimumOrder: restaurant.minimumOrder || 199,
    freeDeliveryAmount: 499,
    holidayMode: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await restaurantRepository.update(restaurant.id, {
        gstNumber: formData.gstNumber,
        deliveryCharges: Number(formData.deliveryCharges),
        minimumOrder: Number(formData.minimumOrder)
      });
      setToastMessage("Restaurant financial settings updated!");
      onRefresh();
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    setSubmitting(true);
    try {
      await restaurantRepository.delete(restaurant.id);
      router.push("/admin/restaurants");
    } catch (err: any) {
      alert("Failed to delete restaurant: " + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" /> Restaurant Settings & Financial Parameters
        </h2>
        <p className="text-xs text-slate-500">Tax charges, packaging fees, minimum order & emergency holiday mode</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">GST Tax Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tax Percentage (%)</label>
            <input
              type="number"
              value={formData.taxPercentage}
              onChange={(e) => setFormData({ ...formData, taxPercentage: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Packaging Fee (₹)</label>
            <input
              type="number"
              value={formData.packagingCharge}
              onChange={(e) => setFormData({ ...formData, packagingCharge: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Base Delivery Fee (₹)</label>
            <input
              type="number"
              value={formData.deliveryCharges}
              onChange={(e) => setFormData({ ...formData, deliveryCharges: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Minimum Order (₹)</label>
            <input
              type="number"
              value={formData.minimumOrder}
              onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Free Delivery Above (₹)</label>
            <input
              type="number"
              value={formData.freeDeliveryAmount}
              onChange={(e) => setFormData({ ...formData, freeDeliveryAmount: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="p-6 bg-rose-50/70 border border-rose-200 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600" /> Danger Zone: Delete Restaurant Entity
        </div>
        <p className="text-slate-600 text-xs">
          Deleting this restaurant entity permanently purges all branches, categories, floor menus, and table reservations from Cloud Firestore.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow text-xs flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Delete Restaurant Permanently
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRestaurant}
        title="Delete Entire Restaurant"
        message="This action is irreversible. All branches, menus, categories & floor layouts for this restaurant will be deleted."
        loading={submitting}
      />
    </div>
  );
}
