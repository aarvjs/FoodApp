"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, Filter, Clock, CheckCircle2, ChevronRight, Truck, PackageCheck, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { OrderStatus } from "@/types";

const statusSteps: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "REJECTED", "CANCELLED"];

export default function SuperAdminOrdersPage() {
  const orders = useStore((state) => state.orders);
  const branches = useStore((state) => state.branches);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterBranch, setFilterBranch] = useState<string>("ALL");

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    const matchBranch = filterBranch === "ALL" || o.branchId === filterBranch;
    return matchStatus && matchBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" /> Global Order Pipeline Monitor
          </h1>
          <p className="text-xs text-slate-500">Real-time status tracking for customer orders across all branch locations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm max-w-full"
          >
            <option value="ALL">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm max-w-full"
          >
            <option value="ALL">All Statuses</option>
            {statusSteps.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((ord) => (
          <div key={ord.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">{ord.orderType}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold">{ord.branchName}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Customer: <strong className="text-slate-800">{ord.customerName}</strong> ({ord.customerPhone})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={ord.status}
                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold border-none"
                >
                  {statusSteps.map((st) => (
                    <option key={st} value={st}>{st.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Items</span>
                {ord.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-800 font-medium">
                    <span>{it.quantity}x {it.productName}</span>
                    <span>₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">₹{ord.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Payment: {ord.paymentMethod} ({ord.paymentStatus})</span>
                  <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {ord.customerAddress && (
                  <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 truncate">
                    Address: {ord.customerAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
