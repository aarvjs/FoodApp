"use client";

import React, { useState, useEffect } from "react";
import { RewardConfig } from "@/models/rewardConfig";
import { rewardConfigService } from "@/services/rewardConfigService";
import { Coins, CheckCircle2, AlertCircle, Save, Loader2, Sparkles, ShieldCheck } from "lucide-react";

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
  currentUserName = "System User"
}) => {
  const [minAmount, setMinAmount] = useState<string>("600");
  const [points, setPoints] = useState<string>("50");
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
          setMinAmount(config.minimumOrderAmount.toString());
          setPoints(config.rewardPoints.toString());
          setStatus(config.status || "ACTIVE");
        } else {
          setExistingConfig(null);
          setMinAmount("600");
          setPoints("50");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!restaurantId || !branchId) {
      setValidationError("Please select a valid restaurant and branch.");
      return;
    }

    const numericMinAmount = parseFloat(minAmount);
    const numericPoints = parseInt(points, 10);

    const payload: Partial<RewardConfig> = {
      restaurantId,
      branchId,
      minimumOrderAmount: isNaN(numericMinAmount) ? -1 : numericMinAmount,
      rewardPoints: isNaN(numericPoints) ? -1 : numericPoints,
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Reward Points Configuration
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
              Configured specifically for <span className="font-semibold text-slate-800">{branchName}</span>
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

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimum Order Amount Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Minimum Order Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="e.g. 600"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Customer order total must reach or exceed this amount to qualify.
            </p>
          </div>

          {/* Reward Points Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reward Points Awarded <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500">
                <Coins className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="e.g. 50"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Number of reward points credited upon eligible order completion.
            </p>
          </div>
        </div>

        {/* Status Toggle & Explanation */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Configuration Status
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
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Rule Preview: </span>
              {status === "ACTIVE" ? (
                <>
                  An order value <span className="font-extrabold text-amber-950">≥ ₹{minAmount || "0"}</span> will earn the customer <span className="font-extrabold text-amber-950">{points || "0"} Reward Points</span>.
                </>
              ) : (
                <span className="text-slate-600 font-medium">
                  Reward Points system is currently <span className="font-bold text-slate-900">DISABLED</span> for this branch.
                </span>
              )}
            </div>
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
