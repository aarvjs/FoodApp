"use client";

import React, { useState, useEffect } from "react";
import { Truck, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Building2, MapPin, Loader2, Save, Check } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { DeliveryChargeSlab } from "@/models/deliveryChargeSlab";
import { deliveryChargeSlabRepository } from "@/repositories/deliveryChargeSlabRepository";
import { deliveryChargeSlabService } from "@/services/deliveryChargeSlabService";

export default function BranchManagerDeliveryChargesPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const updateBranch = useStore((state) => state.updateBranch);

  const assignedBranch = branches.find(
    (b) => b.id === user?.assignedBranchId || b.id === user?.branchId
  ) || branches[0];

  const [slabs, setSlabs] = useState<DeliveryChargeSlab[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Maximum Radius Form State
  const [radiusInput, setRadiusInput] = useState<string>("");
  const [savingRadius, setSavingRadius] = useState<boolean>(false);
  const [radiusSavedToast, setRadiusSavedToast] = useState<boolean>(false);
  const [radiusError, setRadiusError] = useState<string | null>(null);

  // GST / Tax Form State
  const [taxInput, setTaxInput] = useState<string>("");
  const [savingTax, setSavingTax] = useState<boolean>(false);
  const [taxSavedToast, setTaxSavedToast] = useState<boolean>(false);
  const [taxError, setTaxError] = useState<string | null>(null);

  // Modal state for Slabs
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSlab, setEditingSlab] = useState<DeliveryChargeSlab | null>(null);
  const [minDist, setMinDist] = useState<string>("");
  const [maxDist, setMaxDist] = useState<string>("");
  const [charge, setCharge] = useState<string>("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savingSlab, setSavingSlab] = useState<boolean>(false);

  // Sync radius & tax inputs with assigned branch
  useEffect(() => {
    if (assignedBranch) {
      if (assignedBranch.maxRadiusConfigured) {
        setRadiusInput((assignedBranch.maximumDeliveryRadius ?? assignedBranch.deliveryRadiusKm ?? 20).toString());
      } else {
        setRadiusInput("");
      }
      setTaxInput((assignedBranch.taxPercentage ?? assignedBranch.gstPercentage ?? 0).toString());
    } else {
      setRadiusInput("");
      setTaxInput("0");
    }
    setRadiusError(null);
    setTaxError(null);
  }, [assignedBranch]);


  // Real-time Firestore listener scoped to assigned branch ID
  useEffect(() => {
    if (!assignedBranch?.id) {
      setSlabs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = deliveryChargeSlabRepository.subscribeByBranch(
      assignedBranch.id,
      (fetchedSlabs) => {
        setSlabs(fetchedSlabs);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch branch delivery charge slabs:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [assignedBranch?.id]);

  const handleSaveMaximumRadius = async (e: React.FormEvent) => {
    e.preventDefault();
    setRadiusError(null);

    if (!assignedBranch) {
      setRadiusError("No assigned branch found.");
      return;
    }

    const radVal = parseFloat(radiusInput);
    if (isNaN(radVal) || radVal <= 0) {
      setRadiusError("Maximum delivery radius must be a valid positive number (e.g., 20).");
      return;
    }

    setSavingRadius(true);
    try {
      await updateBranch(assignedBranch.id, {
        maximumDeliveryRadius: radVal,
        deliveryRadiusKm: radVal,
        maxRadiusConfigured: true
      });
      setRadiusSavedToast(true);
      setTimeout(() => setRadiusSavedToast(false), 3000);
    } catch (err: any) {
      setRadiusError("Failed to save radius: " + err.message);
    } finally {
      setSavingRadius(false);
    }
  };

  const handleSaveTaxPercentage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxError(null);

    if (!assignedBranch) {
      setTaxError("No assigned branch found.");
      return;
    }

    const taxVal = parseFloat(taxInput);
    if (isNaN(taxVal) || taxVal < 0) {
      setTaxError("GST / Tax percentage must be a valid non-negative number (e.g., 0 or 5).");
      return;
    }

    setSavingTax(true);
    try {
      await updateBranch(assignedBranch.id, {
        taxPercentage: taxVal,
        gstPercentage: taxVal,
      });
      setTaxSavedToast(true);
      setTimeout(() => setTaxSavedToast(false), 3000);
    } catch (err: any) {
      setTaxError("Failed to save GST / Tax percentage: " + err.message);
    } finally {
      setSavingTax(false);
    }
  };


  const isMaxRadiusConfigured = Boolean(assignedBranch?.maxRadiusConfigured);
  const maxConfiguredRadius = assignedBranch?.maximumDeliveryRadius ?? assignedBranch?.deliveryRadiusKm;

  const handleOpenAddModal = () => {
    setEditingSlab(null);
    setMinDist("");
    setMaxDist("");
    setCharge("");
    setStatus("ACTIVE");
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (slab: DeliveryChargeSlab) => {
    setEditingSlab(slab);
    setMinDist(slab.minDistanceKm.toString());
    setMaxDist(slab.maxDistanceKm.toString());
    setCharge(slab.deliveryCharge.toString());
    setStatus(slab.status);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSaveSlab = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!assignedBranch) {
      setErrorMsg("No assigned branch found for this account.");
      return;
    }

    const minNum = parseFloat(minDist);
    const maxNum = parseFloat(maxDist);
    const chargeNum = parseFloat(charge);

    const payload: Partial<DeliveryChargeSlab> = {
      restaurantId: assignedBranch.restaurantId,
      branchId: assignedBranch.id,
      minDistanceKm: minNum,
      maxDistanceKm: maxNum,
      deliveryCharge: chargeNum,
      status: status
    };

    const validation = deliveryChargeSlabService.validateSlab(
      payload,
      slabs,
      editingSlab?.id,
      maxConfiguredRadius,
      isMaxRadiusConfigured
    );

    if (!validation.isValid) {
      setErrorMsg(validation.error || "Validation error.");
      return;
    }

    setSavingSlab(true);
    try {
      if (editingSlab) {
        await deliveryChargeSlabService.updateSlab(
          editingSlab.id,
          payload,
          slabs,
          maxConfiguredRadius,
          isMaxRadiusConfigured
        );
      } else {
        await deliveryChargeSlabService.addSlab(
          payload,
          slabs,
          maxConfiguredRadius,
          isMaxRadiusConfigured
        );
      }
      setShowModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save delivery charge slab.");
    } finally {
      setSavingSlab(false);
    }
  };

  const handleDeleteSlab = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery charge slab?")) return;
    try {
      await deliveryChargeSlabService.deleteSlab(id);
    } catch (err: any) {
      alert("Failed to delete slab: " + err.message);
    }
  };

  const handleToggleStatus = async (slab: DeliveryChargeSlab) => {
    try {
      await deliveryChargeSlabService.toggleSlabStatus(
        slab.id,
        slab.status,
        slabs,
        maxConfiguredRadius,
        isMaxRadiusConfigured
      );
    } catch (err: any) {
      alert("Status toggle failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" /> Branch Delivery Charge Slabs
          </h1>
          <p className="text-xs text-slate-500">
            Manage Maximum Delivery Radius and distance-based fees for {assignedBranch?.name || "your branch"}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={!assignedBranch}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Delivery Charge Slab
        </button>
      </div>

      {/* Branch Info Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Branch
          </span>
          <h3 className="font-bold text-slate-900 text-sm">{assignedBranch?.name || "Branch Office"}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" /> {assignedBranch?.address || assignedBranch?.location?.formattedAddress || "Location set"}
          </p>
        </div>
      </div>

      {/* Maximum Delivery Radius Configuration Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Maximum Delivery Radius</h3>
              {isMaxRadiusConfigured ? (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Configured: {maxConfiguredRadius} KM
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Not Configured
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure the maximum outer delivery boundary for this branch. Distance slabs must stay within this radius.
            </p>
          </div>
        </div>

        {radiusSavedToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Maximum Delivery Radius updated successfully!
          </div>
        )}

        {radiusError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{radiusError}</span>
          </div>
        )}

        <form onSubmit={handleSaveMaximumRadius} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-lg">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Maximum Delivery Radius (KM)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Enter max radius (e.g. 20)"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                required
                className="w-full p-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">
                KM
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingRadius || !assignedBranch}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {savingRadius ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Radius
          </button>
        </form>
      </div>

      {/* GST / Tax (%) Configuration Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">GST / Tax Percentage</h3>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-600" /> Configured: {assignedBranch?.taxPercentage ?? assignedBranch?.gstPercentage ?? 0}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Set the GST / Tax percentage applied to orders for {assignedBranch?.name || "your branch"}. Set to 0 to disable tax.
            </p>
          </div>
        </div>

        {taxSavedToast && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-600" /> GST / Tax percentage saved successfully for {assignedBranch?.name}!
          </div>
        )}

        {taxError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{taxError}</span>
          </div>
        )}

        <form onSubmit={handleSaveTaxPercentage} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-lg">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GST / Tax Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Enter tax percentage (e.g. 0 or 5)"
                value={taxInput}
                onChange={(e) => setTaxInput(e.target.value)}
                required
                className="w-full p-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">
                %
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingTax || !assignedBranch}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {savingTax ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save GST / Tax
          </button>
        </form>
      </div>


      {/* Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Configured Distance Slabs</h3>
            <p className="text-xs text-slate-500">
              Delivery fees configured here apply dynamically to customers ordering from this branch
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {slabs.length} Slab{slabs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-slate-400 gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            Loading distance slabs...
          </div>
        ) : slabs.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Truck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 text-xs">No Delivery Charge Slabs Configured</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Add custom distance ranges (e.g. 0-3 KM → ₹20) to set up distance-based delivery charges for your branch.
            </p>
            <button
              onClick={handleOpenAddModal}
              disabled={!assignedBranch}
              className="mt-2 px-3.5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Configure First Slab
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Distance Range</th>
                  <th className="py-3 px-4">Delivery Charge</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slabs.map((slab) => (
                  <tr key={slab.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {slab.minDistanceKm} KM - {slab.maxDistanceKm} KM
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700 text-sm">
                      ₹{slab.deliveryCharge}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(slab)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          slab.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {slab.status === "ACTIVE" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(slab)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Slab"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlab(slab.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Slab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                {editingSlab ? "Edit Delivery Slab" : "Add Delivery Charge Slab"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlab} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Distance (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 0"
                    value={minDist}
                    onChange={(e) => setMinDist(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maximum Distance (KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g. 5"
                    value={maxDist}
                    onChange={(e) => setMaxDist(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Charge (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 30"
                  value={charge}
                  onChange={(e) => setCharge(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slab Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("ACTIVE")}
                    className={`py-2 rounded-xl font-bold text-xs transition-all ${
                      status === "ACTIVE"
                        ? "bg-amber-500 text-slate-950 shadow font-bold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("INACTIVE")}
                    className={`py-2 rounded-xl font-bold text-xs transition-all ${
                      status === "INACTIVE"
                        ? "bg-slate-700 text-white shadow"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSlab}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow flex items-center gap-2"
                >
                  {savingSlab && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSlab ? "Update Slab" : "Save Slab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
