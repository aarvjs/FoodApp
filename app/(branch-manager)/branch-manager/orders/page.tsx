"use client";

import React, { useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, PackageCheck, AlertCircle, ChevronRight, XCircle, Check, Trash2, Loader2, MessageSquare } from "lucide-react";
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

const cancellationReasons = [
  "Ordered by mistake",
  "Changed my mind",
  "Taking too long",
  "Found another option",
  "Incorrect order",
  "Other"
];

export default function BranchManagerOrdersPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const cancelOrderStore = useStore((state) => state.cancelOrder);
  const deleteOrderStore = useStore((state) => state.deleteOrder);

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

  // Cancel Order Modal State
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState(cancellationReasons[0]);
  const [customReason, setCustomReason] = useState("");
  const [cancellationNote, setCancellationNote] = useState("");

  // Delete Order Modal State
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const filteredOrders = branchOrders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "REJECTED") return o.status === "REJECTED" || o.status === "CANCELLED";
    return o.status === activeTab;
  });

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err: any) {
      alert(err.message || "This order has already been cancelled and cannot be updated.");
    }
  };

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

  const handleConfirmManagerCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId) return;
    setSubmitting(true);

    try {
      const finalReason = cancellationReason === "Other" && customReason.trim() !== "" ? customReason.trim() : cancellationReason;
      const res = await cancelOrderStore(cancellingOrderId, "branch_manager", finalReason, cancellationNote);
      if (!res.success) {
        alert(res.message || "Failed to cancel order.");
      } else {
        setCancellingOrderId(null);
        setCancellationReason(cancellationReasons[0]);
        setCustomReason("");
        setCancellationNote("");
      }
    } catch (err: any) {
      alert("Failed to cancel order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrderId) return;
    setSubmitting(true);
    try {
      await deleteOrderStore(deletingOrderId);
      setDeletingOrderId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete cancelled order.");
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
            const isCancelled = ord.status === "CANCELLED";
            const nextStatus = isCancelled ? null : getNextStatus(ord.status);
            const isCancellable = ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && ord.status !== "REJECTED";

            return (
              <div key={ord.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
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

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Actions for PENDING orders: Accept vs Reject */}
                    {ord.status === "PENDING" && (
                      <>
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
                      </>
                    )}

                    {/* Next Step for ACCEPTED/PREPARING/READY/OUT_FOR_DELIVERY */}
                    {nextStatus && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, nextStatus)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                      >
                        {getNextStatusLabel(ord.status)} <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {isCancellable && (
                      <button
                        onClick={() => {
                          setCancellingOrderId(ord.id);
                          setCancellationReason(cancellationReasons[0]);
                          setCustomReason("");
                          setCancellationNote("");
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Order
                      </button>
                    )}

                    {isCancelled && (
                      <button
                        onClick={() => setDeletingOrderId(ord.id)}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete / Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Items & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Items Ordered & Customizations</span>
                      {ord.items?.map((it: any, idx: number) => {
                        const baseP = it.basePrice || it.price || 0;
                        const unitP = it.unitPrice || it.price || 0;
                        const qty = it.quantity || 1;
                        const totalItemP = it.itemTotal || it.totalPrice || (unitP * qty);
                        const addonsP = unitP > baseP ? unitP - baseP : 0;
                        const variantStr = typeof it.selectedVariant === 'string' 
                          ? it.selectedVariant 
                          : it.selectedVariant?.name || it.size || null;

                        return (
                          <div key={idx} className="space-y-1.5 mt-2 border-b border-slate-100 pb-2">
                            <div className="flex justify-between items-start font-semibold text-slate-800">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>{qty}x {it.productName || it.name || it.comboName || 'Item'}</span>
                                  {(it.isCombo || it.comboName || it.itemType === 'combo') && (
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[9px] rounded">
                                      COMBO{it.comboName ? `: ${it.comboName}` : ""}
                                    </span>
                                  )}
                                </div>
                                {variantStr && (
                                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                                    Variant: <span className="text-slate-900 font-bold">{variantStr}</span>
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400">Base: ₹{baseP} | Unit: ₹{unitP} x {qty}</p>
                              </div>
                              <span className="font-extrabold text-slate-900 text-sm">₹{totalItemP}</span>
                            </div>

                            {/* Combo Options */}
                            {it.selectedComboOptions && it.selectedComboOptions.length > 0 && (
                              <div className="text-[10px] text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-xl space-y-0.5 font-medium">
                                <p className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">Selected Combo Options:</p>
                                {it.selectedComboOptions.map((opt: any, oIdx: number) => (
                                  <div key={oIdx} className="flex justify-between text-[10px]">
                                    <span>• {opt.categoryName || opt.groupName || 'Option'}: <strong>{opt.optionName || opt.name}</strong></span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Customizations / Addons */}
                            {(it.customizationSelections?.length > 0 || (it.customizations && it.customizations.length > 0) || it.removedItems?.length > 0 || it.replacements?.length > 0 || it.selectedAddons?.length > 0) && (
                              <div className="text-[10.5px] text-amber-900 bg-amber-50/90 border border-amber-200/80 p-2 rounded-xl space-y-1 font-medium">
                                <div className="flex justify-between items-center text-[10px] font-bold text-amber-900 border-b border-amber-200/60 pb-1">
                                  <span>Customizations & Add-ons</span>
                                  <span>Base: ₹{baseP}{addonsP > 0 ? ` + Add-ons: ₹${addonsP}` : ''}</span>
                                </div>
                                {it.customizationSelections && it.customizationSelections.length > 0 ? (
                                  it.customizationSelections.map((c: any, cIdx: number) => (
                                    <div key={cIdx} className="flex justify-between">
                                      <span>• {c.groupName || 'Option'}: <strong>{c.optionName || c.name}</strong></span>
                                      <span className="font-semibold text-amber-800">+{c.additionalPrice > 0 ? `₹${c.additionalPrice}` : 'Free'}</span>
                                    </div>
                                  ))
                                ) : (
                                  it.customizations?.map((c: string, cIdx: number) => (
                                    <div key={cIdx}>• {c}</div>
                                  ))
                                )}
                                {it.removedItems?.length > 0 && <p className="text-rose-700 font-semibold">Removed: {it.removedItems.join(', ')}</p>}
                                {it.replacements?.length > 0 && <p className="text-amber-800 font-semibold">Replacements: {it.replacements.join(', ')}</p>}
                                {it.selectedAddons?.length > 0 && <p className="text-blue-800 font-semibold">Add-ons: {it.selectedAddons.join(', ')}</p>}
                                <div className="text-[10px] font-bold text-amber-900 pt-1 border-t border-amber-200/60 text-right">
                                  Final Item Unit Price: ₹{unitP} × {qty} = ₹{totalItemP}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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

                    {ord.status === "CANCELLED" && (
                      <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                        <div className="flex justify-between items-center font-extrabold text-[11px]">
                          <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-rose-600" /> ORDER CANCELLED</span>
                          <span className="capitalize px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[9px]">By: {ord.cancelledBy || 'Customer'}</span>
                        </div>
                        <p className="text-[11px]"><strong>Reason:</strong> {ord.cancellationReason || "N/A"}</p>
                        {ord.cancellationNote && <p className="text-[10.5px] italic text-rose-800"><strong>Note:</strong> {ord.cancellationNote}</p>}
                        {ord.cancelledAt && (
                          <p className="text-[9.5px] text-rose-600 font-mono">
                            Time: {new Date(ord.cancelledAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
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

      {/* Branch Manager Cancel Confirmation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Cancel Order (Branch Manager)
              </h2>
              <button onClick={() => setCancellingOrderId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmManagerCancel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Why are you cancelling this order?</label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {cancellationReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {cancellationReason === "Other" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specify Reason *</label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    placeholder="Enter reason..."
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Note (Optional)</label>
                <textarea
                  rows={2}
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  placeholder="Enter optional details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingOrderId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Manager Delete Confirmation Modal */}
      {deletingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" /> Delete this cancelled order?
              </h2>
              <button onClick={() => setDeletingOrderId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This will remove the cancelled order from this panel. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingOrderId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
