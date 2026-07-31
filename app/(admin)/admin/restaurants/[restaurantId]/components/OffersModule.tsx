"use client";

import React, { useState } from "react";
import { Tag, Plus, Trash2, Edit3, X, Loader2, Calendar } from "lucide-react";
import { OfferModel } from "@/models/offer";
import { BranchModel } from "@/models/branch";
import { offerRepository } from "@/repositories/offerRepository";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface OffersModuleProps {
  restaurantId: string;
  branches: BranchModel[];
  offers: OfferModel[];
  onRefresh: () => void;
}

export function OffersModule({ restaurantId, branches, offers, onRefresh }: OffersModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    branchId: branches[0]?.id || "",
    title: "Flat 20% OFF",
    coupon: "FLAT20",
    discountPercentage: 20,
    minimumOrder: 299,
    status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "DRAFT"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await offerRepository.create({
        restaurantId,
        branchId: formData.branchId || branches[0]?.id || "",
        title: formData.title,
        coupon: formData.coupon,
        discountPercentage: Number(formData.discountPercentage),
        minimumOrder: Number(formData.minimumOrder),
        status: formData.status
      });
      setToastMessage("Promotion offer created!");
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert("Failed to create offer: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOfferId) return;
    setSubmitting(true);
    try {
      await offerRepository.delete(deletingOfferId);
      setToastMessage("Offer deleted.");
      setDeletingOfferId(null);
      onRefresh();
    } catch (err: any) {
      alert("Failed to delete offer: " + err.message);
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
            <Tag className="w-5 h-5 text-emerald-600" /> Restaurant Offers & Coupons
          </h2>
          <p className="text-xs text-slate-500">Configure discount codes, flat offers & minimum order requirements</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {offers.map((off) => (
          <div key={off.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="text-base">{off.title}</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-mono">{off.coupon}</span>
            </div>

            <div className="text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <p>Discount: <strong className="text-emerald-600 font-bold">{off.discountPercentage}% OFF</strong></p>
              <p>Min Order: <strong>₹{off.minimumOrder}</strong></p>
            </div>

            <div className="flex items-center justify-end pt-1 border-t border-slate-100">
              <button onClick={() => setDeletingOfferId(off.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create Promotion Offer</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {branches.length > 0 && (
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
                <label className="block font-bold text-slate-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Flat 20% OFF"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.coupon}
                    onChange={(e) => setFormData({ ...formData, coupon: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingOfferId}
        onClose={() => setDeletingOfferId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Offer"
        message="Are you sure you want to delete this promotion offer?"
        loading={submitting}
      />
    </div>
  );
}
