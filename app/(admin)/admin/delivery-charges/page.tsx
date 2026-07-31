"use client";

import React, { useState } from "react";
import { Truck, Save } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function SuperAdminDeliveryChargesPage() {
  const deliveryRules = useStore((state) => state.deliveryRules);
  const updateDeliveryRule = useStore((state) => state.updateDeliveryRule);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-600" /> Delivery Charges Setup
        </h1>
        <p className="text-xs text-slate-500">Configure distance slab-based delivery fee rules across restaurants</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Distance Slabs & Fee Matrix</h3>
        <div className="space-y-3">
          {deliveryRules.map((rule) => (
            <div key={rule.id} className="p-4 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Distance Slab</span>
                <span className="font-bold text-slate-800">{rule.minDistanceKm} KM - {rule.maxDistanceKm} KM</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Base Fee (₹)</span>
                <input
                  type="number"
                  value={rule.baseCharge}
                  onChange={(e) => updateDeliveryRule(rule.id, { baseCharge: Number(e.target.value) })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Per Extra KM Fee (₹)</span>
                <input
                  type="number"
                  value={rule.perKmCharge}
                  onChange={(e) => updateDeliveryRule(rule.id, { perKmCharge: Number(e.target.value) })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>
              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px]">
                  <Save className="w-3.5 h-3.5" /> Auto Saved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
