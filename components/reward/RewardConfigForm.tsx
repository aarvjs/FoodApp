"use client";

import React, { useState, useEffect } from "react";
import { RewardConfig, RewardSlab } from "@/models/rewardConfig";
import { rewardConfigService } from "@/services/rewardConfigService";
import { DEFAULT_REWARD_SLABS } from "@/repositories/rewardConfigRepository";
import {
  Coins,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Sliders
} from "lucide-react";

interface RewardConfigFormProps {
  restaurantId: string;
  branchId: string;
  branchName?: string;
  currentUserRole?: string;
  currentUserName?: string;
}

export const RewardConfigForm: React.FC<RewardConfigFormProps> = ({
  restaurantId,
  branchId,
  branchName = "Selected Branch",
  currentUserRole = "admin",
  currentUserName = "System User"
}) => {
  const [pointValue, setPointValue] = useState<string>("0.25");
  const [slabs, setSlabs] = useState<RewardSlab[]>(DEFAULT_REWARD_SLABS);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingConfig, setExistingConfig] = useState<RewardConfig | null>(null);

  useEffect(() => {
    if (!branchId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setValidationError(null);
    setSuccessMessage(null);

    const unsub = rewardConfigService.subscribeToBranchRewardConfig(
      branchId,
      (config) => {
        if (config) {
          setExistingConfig(config);
          setPointValue((config.pointValue ?? 0.25).toString());
          setSlabs(
            Array.isArray(config.slabs) && config.slabs.length > 0
              ? config.slabs
              : DEFAULT_REWARD_SLABS
          );
          setStatus(config.status || "ACTIVE");
        } else {
          setExistingConfig(null);
          setPointValue("0.25");
          setSlabs(DEFAULT_REWARD_SLABS);
          setStatus("ACTIVE");
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn("Error subscribing to reward config:", err);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, [branchId]);

  const handleAddSlab = () => {
    const newId = `slab-${Date.now()}`;
    const nextAmount = slabs.length > 0 ? Math.max(...slabs.map((s) => s.minAmount)) + 100 : 200;
    const nextPoints = slabs.length > 0 ? Math.max(...slabs.map((s) => s.rewardPoints)) + 5 : 10;
    const newSlab: RewardSlab = {
      id: newId,
      minAmount: nextAmount,
      rewardPoints: nextPoints,
      enabled: true
    };
    setSlabs([...slabs, newSlab]);
  };

  const handleRemoveSlab = (id: string) => {
    if (slabs.length <= 1) {
      setValidationError("At least one reward slab is required.");
      return;
    }
    setSlabs(slabs.filter((s) => s.id !== id));
  };

  const handleUpdateSlab = (id: string, field: keyof RewardSlab, value: any) => {
    setSlabs(
      slabs.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!restaurantId || !branchId) {
      setValidationError("Please select a valid restaurant and branch.");
      return;
    }

    const numericPointValue = parseFloat(pointValue);
    if (isNaN(numericPointValue) || numericPointValue <= 0) {
      setValidationError("Point value must be a positive number greater than ₹0.");
      return;
    }

    // Sort slabs by minAmount ascending
    const sortedSlabs = [...slabs].sort((a, b) => Number(a.minAmount) - Number(b.minAmount));

    const payload: Partial<RewardConfig> = {
      restaurantId,
      branchId,
      branchScope: branchId === "ALL" ? "ALL" : "BRANCH",
      pointValue: numericPointValue,
      slabs: sortedSlabs,
      status
    };

    const validation = rewardConfigService.validateRewardConfig(payload);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid configuration parameters.");
      return;
    }

    try {
      setIsSaving(true);
      await rewardConfigService.saveRewardConfig(payload, currentUserName);
      setSuccessMessage(`Reward Points configuration saved successfully for ${branchName}!`);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setValidationError(err.message || "Failed to save Reward Points configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading reward configuration...</p>
      </div>
    );
  }

  const numericPointVal = parseFloat(pointValue) || 0.25;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Reward Points & Slabs Configuration
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 border border-slate-300"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 inline" />
              Scope: <span className="font-semibold text-slate-800">{branchId === "ALL" ? "ALL BRANCHES (Global)" : branchName}</span>
            </p>
          </div>
        </div>

        {existingConfig?.updatedAt && (
          <div className="text-right text-[11px] text-slate-400">
            <span>Last Updated: </span>
            <span className="font-medium text-slate-600">
              {new Date(existingConfig.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Error Notification */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{validationError}</div>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Section 1: Monetary Point Value */}
        <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              1 Reward Point Monetary Value (₹) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-amber-800 font-semibold">
              Example: 20 Points × ₹{numericPointVal.toFixed(2)} = ₹{(20 * numericPointVal).toFixed(2)} Discount
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={pointValue}
                onChange={(e) => setPointValue(e.target.value)}
                placeholder="0.25"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                required
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This configures the conversion rate. When customers redeem points, each point deducts <span className="font-extrabold text-slate-900">₹{numericPointVal.toFixed(2)}</span> from their cart total.
            </p>
          </div>
        </div>

        {/* Section 2: Dynamic Reward Slabs */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" /> Dynamic Reward Tiers / Slabs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Define qualifying order thresholds and corresponding reward points earned per purchase.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSlab}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" /> Add New Slab
            </button>
          </div>

          {/* Slabs Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Slab #</th>
                  <th className="px-4 py-3">Qualifying Order Amount (≥ ₹)</th>
                  <th className="px-4 py-3">Reward Points Awarded</th>
                  <th className="px-4 py-3">Monetary Discount Earned</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {slabs.map((slab, index) => {
                  const monetaryValue = (slab.rewardPoints || 0) * numericPointVal;
                  return (
                    <tr key={slab.id} className={`hover:bg-slate-50/70 transition-colors ${!slab.enabled ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-bold text-slate-700">
                        Tier {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative rounded-lg max-w-[140px]">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={slab.minAmount}
                            onChange={(e) =>
                              handleUpdateSlab(slab.id, "minAmount", parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative rounded-lg max-w-[140px]">
                          <Coins className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-2.5 pointer-events-none" />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={slab.rewardPoints}
                            onChange={(e) =>
                              handleUpdateSlab(slab.id, "rewardPoints", parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block">
                          ₹{monetaryValue.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateSlab(slab.id, "enabled", !slab.enabled)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            slab.enabled
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {slab.enabled ? "ENABLED" : "DISABLED"}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right pr-6">
                        <button
                          type="button"
                          onClick={() => handleRemoveSlab(slab.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Slab"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Status Toggle & Live Rule Preview */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reward System Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStatus("ACTIVE")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  status === "ACTIVE"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                ACTIVE
              </button>
              <button
                type="button"
                onClick={() => setStatus("INACTIVE")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  status === "INACTIVE"
                    ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                INACTIVE
              </button>
            </div>
          </div>

          {/* Business Logic Preview Box */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              Live Rule Preview:
            </div>
            {status === "ACTIVE" ? (
              <p className="text-[11px] leading-relaxed text-amber-900/90 font-medium">
                Customer placing qualifying menu purchases will earn points according to active tiers above. 1 Point = ₹{numericPointVal.toFixed(2)} discount value on future orders.
              </p>
            ) : (
              <p className="text-[11px] text-slate-600 font-medium">
                Reward Points system is currently <span className="font-bold text-slate-900">DISABLED</span> for this configuration.
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
