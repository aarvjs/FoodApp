"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, Filter, Clock, CheckCircle2, ChevronRight, Truck, PackageCheck, AlertCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { OrderStatus } from "@/types";

const statusSteps: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "REJECTED", "CANCELLED"];

const cancellationReasons = [
  "Ordered by mistake",
  "Changed my mind",
  "Taking too long",
  "Found another option",
  "Incorrect order",
  "Other"
];

export default function SuperAdminOrdersPage() {
  const orders = useStore((state) => state.orders);
  const branches = useStore((state) => state.branches);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const cancelOrder = useStore((state) => state.cancelOrder);
  const deleteOrderStore = useStore((state) => state.deleteOrder);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterBranch, setFilterBranch] = useState<string>("ALL");

  // Admin Cancel Modal State
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState(cancellationReasons[0]);
  const [customReason, setCustomReason] = useState("");
  const [cancellationNote, setCancellationNote] = useState("");

  // Admin Delete Confirmation Modal State
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    const matchBranch = filterBranch === "ALL" || o.branchId === filterBranch;
    return matchStatus && matchBranch;
  });

  const handleStatusChange = async (orderId: string, currentStatus: string, newStatus: OrderStatus) => {
    if (currentStatus === "CANCELLED") {
      alert("This order has already been cancelled and cannot be updated.");
      return;
    }
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err: any) {
      alert(err.message || "This order has already been cancelled and cannot be updated.");
    }
  };

  const handleConfirmAdminCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId) return;
    setSubmitting(true);
    try {
      const finalReason = cancellationReason === "Other" && customReason.trim() !== "" ? customReason.trim() : cancellationReason;
      const res = await cancelOrder(cancellingOrderId, "admin", finalReason, cancellationNote);
      if (!res.success) {
        alert(res.message || "Failed to cancel order.");
      } else {
        setCancellingOrderId(null);
        setCancellationReason(cancellationReasons[0]);
        setCustomReason("");
        setCancellationNote("");
      }
    } catch (err: any) {
      alert("Error cancelling order: " + err.message);
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
        {filteredOrders.map((ord) => {
          const isCancelled = ord.status === "CANCELLED";
          const isCancellable = ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && ord.status !== "REJECTED";

          return (
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
                  {!isCancelled ? (
                    <>
                      <span className="text-xs text-slate-400 font-medium">Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, ord.status, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold border-none"
                      >
                        {statusSteps.filter(st => st !== "CANCELLED").map((st) => (
                          <option key={st} value={st}>{st.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-xl uppercase">
                      CANCELLED
                    </span>
                  )}

                  {isCancellable && (
                    <button
                      onClick={() => {
                        setCancellingOrderId(ord.id);
                        setCancellationReason(cancellationReasons[0]);
                        setCustomReason("");
                        setCancellationNote("");
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  )}

                  {isCancelled && (
                    <button
                      onClick={() => setDeletingOrderId(ord.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete / Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Order Items</span>
                  {ord.items?.map((it: any, idx: number) => {
                    const baseP = it.basePrice || it.price || 0;
                    const unitP = it.unitPrice || it.price || 0;
                    const totalItemP = unitP * (it.quantity || 1);
                    const addonsP = unitP > baseP ? unitP - baseP : 0;

                    return (
                      <div key={idx} className="space-y-1 mt-1.5 border-b border-slate-100 pb-1.5">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span>{it.quantity}x {it.productName}</span>
                            {(it.isCombo || it.comboName) && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[9px] rounded">
                                COMBO{it.comboName ? `: ${it.comboName}` : ""}
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-slate-900">₹{totalItemP}</span>
                        </div>

                        {(it.customizationSelections?.length > 0 || (it.customizations && it.customizations.length > 0)) && (
                          <div className="text-[10px] text-amber-900 bg-amber-50/90 border border-amber-200/80 p-2 rounded-xl space-y-0.5 font-medium">
                            <div className="flex justify-between items-center text-[9.5px] font-bold text-amber-900 border-b border-amber-200/60 pb-0.5">
                              <span>Customizations Selected</span>
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
                              it.customizations.map((c: string, cIdx: number) => (
                                <div key={cIdx}>• {c}</div>
                              ))
                            )}
                            <div className="text-[9.5px] font-bold text-amber-900 pt-0.5 border-t border-amber-200/60 text-right">
                              Final Item Unit Price: ₹{unitP}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Amount</span>
                    <span className="text-emerald-600">₹{ord.totalAmount}</span>
                  </div>
                  <div className="flex flex-col text-[11px] text-slate-500 gap-0.5">
                    <div className="flex justify-between">
                      <span>Payment: {ord.paymentGateway ? `${ord.paymentGateway} (${ord.paymentMethod})` : ord.paymentMethod} • <strong className={ord.paymentStatus === 'SUCCESS' || ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>{ord.paymentStatus}</strong></span>
                      <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {ord.transactionId && (
                      <p className="text-[10px] text-slate-500 font-mono">Txn ID: {ord.transactionId}</p>
                    )}
                  </div>
                  {ord.customerAddress && (
                    <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 truncate">
                      Address: {ord.customerAddress}
                    </p>
                  )}

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
        })}
      </div>

      {/* Admin Cancel Confirmation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Cancel Order (Admin)
              </h2>
              <button onClick={() => setCancellingOrderId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdminCancel} className="space-y-4 text-xs">
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

      {/* Admin Delete Confirmation Modal */}
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
