"use client";

import React, { useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, PackageCheck, AlertCircle, ChevronRight, XCircle, Check, Loader2, MessageSquare } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { OrderStatus } from "@/types";

const tabs: { label: string; value: string }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Completed", value: "DELIVERED" },
  { label: "Rejected/Cancelled", value: "REJECTED" }
];

export default function BranchManagerOrdersPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);

  const managerBranchId = user?.assignedBranchId || user?.branchId;
  const assignedBranch = branches.find((b) => b.id === managerBranchId);
  const branchOrders = orders.filter((o) => {
    if (!managerBranchId) return true;
    return o.branchId === managerBranchId;
  });

  const [activeTab, setActiveTab] = useState("ALL");

  // Accept Order Modal
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [customPrepMinutes, setCustomPrepMinutes] = useState<number | "">("");

  // Reject Order Modal
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Kitchen Busy / Out of Stock");

  const [submitting, setSubmitting] = useState(false);

  const filteredOrders = branchOrders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "REJECTED") return o.status === "REJECTED" || o.status === "CANCELLED";
    return o.status === activeTab;
  });

  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingOrderId) return;
    setSubmitting(true);

    try {
      const finalPrepTime = customPrepMinutes !== "" ? Number(customPrepMinutes) : prepTimeMinutes;
      await updateOrderStatus(acceptingOrderId, "ACCEPTED", finalPrepTime);
      setAcceptingOrderId(null);
    } catch (err: any) {
      alert("Failed to accept order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrderId) return;
    setSubmitting(true);

    try {
      await updateOrderStatus(rejectingOrderId, "REJECTED", undefined, rejectionReason);
      setRejectingOrderId(null);
    } catch (err: any) {
      alert("Failed to reject order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case "ACCEPTED": return "PREPARING";
      case "PREPARING": return "READY";
      case "READY": return "OUT_FOR_DELIVERY";
      case "OUT_FOR_DELIVERY": return "DELIVERED";
      default: return null;
    }
  };

  const getNextStatusLabel = (current: OrderStatus): string => {
    switch (current) {
      case "ACCEPTED": return "Start Preparing";
      case "PREPARING": return "Mark Ready";
      case "READY": return "Dispatch (Out for Delivery)";
      case "OUT_FOR_DELIVERY": return "Mark Delivered";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-amber-600" /> Branch Orders Operations
        </h1>
        <p className="text-xs text-slate-500">Live incoming order pipeline with preparation time assignments & status updates</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = tab.value === "ALL" 
            ? branchOrders.length 
            : tab.value === "REJECTED" 
            ? branchOrders.filter(o => o.status === "REJECTED" || o.status === "CANCELLED").length
            : branchOrders.filter(o => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
            No orders found in this status category for your branch.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const nextStatus = getNextStatus(ord.status);
            return (
              <div key={ord.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                        ord.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" :
                        ord.status === "REJECTED" || ord.status === "CANCELLED" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-900"
                      }`}>
                        {ord.status.replace(/_/g, " ")}
                      </span>
                      {ord.estimatedPrepMinutes && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded">
                          ⏱ {ord.estimatedPrepMinutes} Mins Prep
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone})
                    </p>
                  </div>

                  {/* Actions for PENDING orders: Accept vs Reject */}
                  {ord.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAcceptingOrderId(ord.id);
                          setPrepTimeMinutes(20);
                          setCustomPrepMinutes("");
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Accept Order
                      </button>
                      <button
                        onClick={() => {
                          setRejectingOrderId(ord.id);
                          setRejectionReason("Kitchen Busy / Ingredients Unavailable");
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Next Step for ACCEPTED/PREPARING/READY/OUT_FOR_DELIVERY */}
                  {nextStatus && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, nextStatus)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                    >
                      {getNextStatusLabel(ord.status)} <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Items & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Items Ordered & Customizations</span>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="space-y-0.5 mt-1 border-b border-slate-100 pb-1">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{it.quantity}x {it.productName}</span>
                            <span>₹{it.price * it.quantity}</span>
                          </div>
                          {it.customizations && it.customizations.length > 0 && (
                            <p className="text-[10px] text-amber-700 font-medium italic">Note: {it.customizations.join(", ")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Branch: <strong className="text-slate-800">{ord.branchName || assignedBranch?.name || "Branch"}</strong>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Subtotal</span>
                      <span>₹{ord.subtotal || ord.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>GST (Tax)</span>
                      <span>₹{ord.tax ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Delivery Fee</span>
                      <span>₹{ord.deliveryFee ?? 0}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span className="text-amber-600">₹{ord.totalAmount}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 text-[11px] space-y-0.5 text-slate-600">
                      <p>Payment: <strong className="text-slate-800">{ord.paymentMethod} ({ord.paymentStatus})</strong></p>
                      {ord.customerAddress && <p className="truncate">Address: <strong>{ord.customerAddress}</strong></p>}
                      <p className="text-[10px] text-slate-400">Time: {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    {ord.rejectionReason && <p className="text-[11px] text-rose-600 pt-1 border-t border-rose-100 font-bold">Reason: {ord.rejectionReason}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Accept Order Modal - Assign Preparation Time */}
      {acceptingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Accept Order & Assign Prep Time
              </h2>
              <button onClick={() => setAcceptingOrderId(null)} className="p-1 text-slate-400"><XCircle className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConfirmAccept} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">Estimated Preparation Time</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[10, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setPrepTimeMinutes(mins);
                        setCustomPrepMinutes("");
                      }}
                      className={`py-2 rounded-xl font-bold border text-xs transition-all ${
                        prepTimeMinutes === mins && customPrepMinutes === ""
                          ? "bg-emerald-600 text-white border-emerald-600 shadow"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mins} Mins
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Custom Minutes</label>
                  <input
                    type="number"
                    value={customPrepMinutes}
                    onChange={(e) => setCustomPrepMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    placeholder="Enter custom prep minutes (e.g. 25)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAcceptingOrderId(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm & Accept Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Reject Order
              </h2>
              <button onClick={() => setRejectingOrderId(null)} className="p-1 text-slate-400"><XCircle className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Kitchen overwhelmed / item out of stock"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setRejectingOrderId(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
