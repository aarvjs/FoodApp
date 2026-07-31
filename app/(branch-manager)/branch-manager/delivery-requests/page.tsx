"use client";

import React from "react";
import { Bike, Navigation, MapPin } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerDeliveryRequestsPage() {
  const user = useStore((state) => state.user);
  const orders = useStore((state) => state.orders);
  const branchOrders = orders.filter((o) => o.branchId === user?.branchId && o.orderType === "DELIVERY");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bike className="w-6 h-6 text-amber-600" /> Delivery Requests
        </h1>
        <p className="text-xs text-slate-500">Live delivery assignments for your branch rider network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branchOrders.map((ord) => (
          <div key={ord.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-slate-900">{ord.orderNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">
                {ord.status}
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p>Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone})</p>
              <p className="text-slate-500">Destination: {ord.customerAddress || "Branch Radius"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
