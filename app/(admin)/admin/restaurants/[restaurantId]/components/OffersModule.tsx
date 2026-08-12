"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Edit3, X, Loader2, Calendar, Clock, CheckSquare, Square, AlertCircle } from "lucide-react";
import { OfferModel } from "@/models/offer";
import { BranchModel } from "@/models/branch";
import { CategoryModel } from "@/models/category";
import { offerRepository } from "@/repositories/offerRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface OffersModuleProps {
  restaurantId: string;
  branches: BranchModel[];
  offers: OfferModel[];
  onRefresh: () => void;
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function OffersModule({ restaurantId, branches, offers, onRefresh }: OffersModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  const defaultBranchId = branches[0]?.id || "";

  const [formData, setFormData] = useState({
    branchId: defaultBranchId,
    title: "Flat 20% OFF",
    coupon: "FLAT20",
    description: "Get discount on eligible menu items",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 20,
    minimumOrderAmount: 500,
    maximumDiscountAmount: 150,
    validityType: "FULL_DAY" as "FULL_DAY" | "SCHEDULED_TIME",
    startTime: "09:00",
    endTime: "22:00",
    usageLimit: 20,
    applicableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as string[],
    excludedCategoryIds: [] as string[],
    status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "DRAFT"
  });

  useEffect(() => {
    const targetBranch = formData.branchId || defaultBranchId;
    if (targetBranch) {
      categoryRepository.getByBranch(targetBranch).then(setCategories).catch(() => setCategories([]));
    }
  }, [formData.branchId, defaultBranchId]);

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      branchId: defaultBranchId,
      title: "Flat 20% OFF",
      coupon: "FLAT20",
      description: "Get discount on eligible menu items",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minimumOrderAmount: 500,
      maximumDiscountAmount: 150,
      validityType: "FULL_DAY",
      startTime: "09:00",
      endTime: "22:00",
      usageLimit: 20,
      applicableDays: [...ALL_DAYS],
      excludedCategoryIds: [],
      status: "ACTIVE"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (off: OfferModel) => {
    setEditingOffer(off);
    const dType = off.discountType || (off.type === "FLAT_DISCOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE");
    const dVal = off.discountValue !== undefined ? off.discountValue : (off.discountPercentage || 0);
    const minAmt = off.minimumOrderAmount !== undefined ? off.minimumOrderAmount : (off.minimumOrder || 0);

    setFormData({
      branchId: off.branchId || defaultBranchId,
      title: off.title || "",
      coupon: off.coupon || "",
      description: off.description || "",
      discountType: dType as "PERCENTAGE" | "FIXED_AMOUNT",
      discountValue: dVal,
      minimumOrderAmount: minAmt,
      maximumDiscountAmount: off.maximumDiscountAmount || 0,
      validityType: off.validityType || "FULL_DAY",
      startTime: off.startTime || "09:00",
      endTime: off.endTime || "22:00",
      usageLimit: off.usageLimit || 0,
      applicableDays: off.applicableDays && off.applicableDays.length > 0 ? off.applicableDays : [...ALL_DAYS],
      excludedCategoryIds: off.excludedCategoryIds || [],
      status: (off.status as any) || "ACTIVE"
    });
    setIsModalOpen(true);
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.applicableDays.includes(day);
      return {
        ...prev,
        applicableDays: exists
          ? prev.applicableDays.filter((d) => d !== day)
          : [...prev.applicableDays, day]
      };
    });
  };

  const toggleCategoryExclusion = (catId: string) => {
    setFormData((prev) => {
      const exists = prev.excludedCategoryIds.includes(catId);
      return {
        ...prev,
        excludedCategoryIds: exists
          ? prev.excludedCategoryIds.filter((id) => id !== catId)
          : [...prev.excludedCategoryIds, catId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const isPct = formData.discountType === "PERCENTAGE";
      const payload: Partial<OfferModel> = {
        restaurantId,
        branchId: formData.branchId || defaultBranchId,
        title: formData.title,
        coupon: formData.coupon.toUpperCase().trim(),
        description: formData.description,
        type: isPct ? "FLAT_DISCOUNT" : "FLAT_DISCOUNT",
        discountPercentage: isPct ? Number(formData.discountValue) : 0,
        discountValue: Number(formData.discountValue),
        discountType: formData.discountType,
        minimumOrder: Number(formData.minimumOrderAmount),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscountAmount: isPct ? Number(formData.maximumDiscountAmount || 0) : 0,
        validityType: formData.validityType,
        startTime: formData.validityType === "SCHEDULED_TIME" ? formData.startTime : "",
        endTime: formData.validityType === "SCHEDULED_TIME" ? formData.endTime : "",
        usageLimit: Number(formData.usageLimit || 0),
        applicableDays: formData.applicableDays,
        excludedCategoryIds: formData.excludedCategoryIds,
        status: formData.status,
        isActive: formData.status === "ACTIVE"
      };

      if (editingOffer) {
        await offerRepository.update(editingOffer.id, payload);
        setToastMessage("Promotion offer updated successfully!");
      } else {
        await offerRepository.create(payload);
        setToastMessage("Promotion offer created successfully!");
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert("Failed to save offer: " + err.message);
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

  const getStatusBadge = (off: OfferModel) => {
    const limit = off.usageLimit || 0;
    const count = off.usageCount || 0;
    if (limit > 0 && count >= limit) {
      return { text: "LIMIT REACHED", cls: "bg-rose-100 text-rose-800 border-rose-200" };
    }
    if (off.status === "EXPIRED" || off.isActive === false) {
      return { text: "EXPIRED", cls: "bg-slate-200 text-slate-700 border-slate-300" };
    }
    if (off.status === "DRAFT") {
      return { text: "DRAFT", cls: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    return { text: "ACTIVE", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" };
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
          <p className="text-xs text-slate-500">Configure discount codes, flat/percentage offers, maximum caps & scheduled rules</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {offers.map((off) => {
          const limit = off.usageLimit || 0;
          const count = off.usageCount || 0;
          const remaining = limit > 0 ? Math.max(0, limit - count) : "Unlimited";
          const minOrd = off.minimumOrderAmount !== undefined ? off.minimumOrderAmount : (off.minimumOrder || 0);
          const dType = off.discountType || (off.discountPercentage ? "PERCENTAGE" : "FIXED_AMOUNT");
          const dVal = off.discountValue !== undefined ? off.discountValue : (off.discountPercentage || 0);
          const statusObj = getStatusBadge(off);

          const excludedNames = categories
            .filter((c) => (off.excludedCategoryIds || []).includes(c.id))
            .map((c) => c.name);

          return (
            <div key={off.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{off.title}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg font-mono font-bold text-xs">
                    {off.coupon}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusObj.cls}`}>
                  {statusObj.text}
                </span>
              </div>

              <div className="text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <strong className="text-emerald-700 font-bold">
                    {dType === "PERCENTAGE" ? `${dVal}% OFF` : `₹${dVal} OFF`}
                  </strong>
                </div>

                {dType === "PERCENTAGE" && (off.maximumDiscountAmount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Max Discount Cap:</span>
                    <strong className="text-slate-900">₹{off.maximumDiscountAmount}</strong>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Min Order Subtotal:</span>
                  <strong className="text-slate-900">₹{minOrd}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Usage Count:</span>
                  <strong className="text-slate-900 font-mono">
                    {limit > 0 ? `${count} / ${limit}` : `${count} (No Limit)`}
                  </strong>
                </div>

                {limit > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Remaining Slots:</span>
                    <strong className="font-bold">{remaining}</strong>
                  </div>
                )}

                <div className="pt-1 text-[11px] border-t border-slate-200/60">
                  <p className="flex items-center gap-1 text-slate-700">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {off.validityType === "SCHEDULED_TIME"
                      ? `Scheduled: ${off.startTime || "00:00"} - ${off.endTime || "23:59"}`
                      : "Full Day Availability"}
                  </p>
                  <p className="flex items-center gap-1 text-slate-700 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {off.applicableDays && off.applicableDays.length > 0 && off.applicableDays.length < 7
                      ? off.applicableDays.join(", ")
                      : "All Days (Mon - Sun)"}
                  </p>
                  {excludedNames.length > 0 && (
                    <p className="text-rose-600 mt-1">
                      <strong>Excluded:</strong> {excludedNames.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(off)}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 font-bold"
                >
                  <Edit3 className="w-4 h-4 text-emerald-600" /> Edit
                </button>
                <button
                  onClick={() => setDeletingOfferId(off.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingOffer ? "Edit Offer & Coupon Rules" : "Create Promotion Offer"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {branches.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Branch *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name || "Branch"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Offer Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    placeholder="e.g. Weekend Mega Discount"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.coupon}
                    onChange={(e) => setFormData({ ...formData, coupon: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-emerald-700"
                    placeholder="e.g. FLAT20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 20% OFF on all orders above ₹500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800">Discount Configuration</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="PERCENTAGE">Percentage Discount (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount Discount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {formData.discountType === "PERCENTAGE" ? "Discount Percentage (%) *" : "Discount Amount (₹) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {formData.discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Maximum Discount Cap (₹) <span className="font-normal text-slate-500">(Optional / 0 = Unlimited)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.maximumDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                      placeholder="e.g. 150 (Caps max discount at ₹150)"
                    />
                  </div>
                )}
              </div>

              {/* Usage & Order Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Maximum Total Uses <span className="font-normal text-slate-500">(0 = Unlimited)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {/* Offer Validity & Hours */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" /> Offer Time Validity
                </h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="validityType"
                      value="FULL_DAY"
                      checked={formData.validityType === "FULL_DAY"}
                      onChange={() => setFormData({ ...formData, validityType: "FULL_DAY" })}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    Full Day Availability
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="validityType"
                      value="SCHEDULED_TIME"
                      checked={formData.validityType === "SCHEDULED_TIME"}
                      onChange={() => setFormData({ ...formData, validityType: "SCHEDULED_TIME" })}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    Scheduled Hours
                  </label>
                </div>

                {formData.validityType === "SCHEDULED_TIME" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule by Days */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Applicable Days</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_DAYS.map((day) => {
                    const isChecked = formData.applicableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all text-[11px] ${
                          isChecked
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Exclusion */}
              {categories.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Exclude Categories <span className="font-normal text-slate-500">(Selected categories won't receive discount)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {categories.map((cat) => {
                      const isExcluded = formData.excludedCategoryIds.includes(cat.id);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => toggleCategoryExclusion(cat.id)}
                          className={`p-2 rounded-lg border text-left font-bold transition-all ${
                            isExcluded
                              ? "bg-rose-50 border-rose-400 text-rose-800"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          {isExcluded ? "❌ " : "✓ "} {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Available for customers)</option>
                  <option value="DRAFT">DRAFT (Disabled)</option>
                  <option value="EXPIRED">EXPIRED (Manually Expired)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingOffer ? "Update Offer Rules" : "Create Offer"}
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

