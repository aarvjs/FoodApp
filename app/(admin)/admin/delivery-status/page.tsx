"use client";

import React from "react";
import { Activity, Bike, Navigation, MapPin } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function SuperAdminDeliveryStatusPage() {
  const orders = useStore((state) => state.orders);
  const activeDeliveries = orders.filter((o) => o.status === "OUT_FOR_DELIVERY");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-600" /> Active Delivery Status Monitor
        </h1>
        <p className="text-xs text-slate-500">Live delivery fleet monitoring across branch service radiuses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeDeliveries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 col-span-2 text-slate-500 text-xs">
            No orders currently out for delivery.
          </div>
        ) : (
          activeDeliveries.map((ord) => (
            <div key={ord.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-slate-900">{ord.orderNumber}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 animate-pulse">
                  OUT FOR DELIVERY
                </span>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p>Branch: <strong>{ord.branchName}</strong></p>
                <p>Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone})</p>
                <p className="text-slate-500 truncate">Destination: {ord.customerAddress}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
