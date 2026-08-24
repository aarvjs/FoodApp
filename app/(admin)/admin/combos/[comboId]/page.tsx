"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Package } from "lucide-react";
import { Combo } from "@/types";
import { subscribeToSingleCombo } from "@/services/comboService";
import { ComboDetailPage } from "@/components/combos/ComboDetailPage";

export default function DirectAdminComboDetailPage() {
  const params = useParams();
  const router = useRouter();
  const comboId = (params?.comboId as string) || "";

  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!comboId) return;

    const unsubscribe = subscribeToSingleCombo(comboId, (fetchedCombo: Combo | null) => {
      setCombo(fetchedCombo);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [comboId]);

  const handleBack = () => {
    if (combo?.restaurantId && combo.restaurantId !== "all") {
      router.push(`/admin/restaurants/${combo.restaurantId}`);
    } else {
      router.push("/admin/menus");
    }
  };

  if (loading && !combo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading Combo Details...</p>
        </div>
      </div>
    );
  }

  if (!combo && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Combo Not Found</h2>
          <p className="text-xs text-slate-500">The requested combo could not be located or may have been deleted.</p>
          <button
            onClick={() => router.push("/admin/menus")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
          >
            Back to Menus
          </button>
        </div>
      </div>
    );
  }

  return (
    <ComboDetailPage
      combo={combo!}
      onBack={handleBack}
      restaurantId={combo?.restaurantId || ""}
      branchId={combo?.branchId}
      branchIds={combo?.branchIds}
    />
  );
}
