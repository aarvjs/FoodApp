"use client";

import React, { useState } from "react";
import { ShoppingBag, Eye, Clock, CheckCircle2, XCircle, ChevronRight, Check, Trash2, Loader2 } from "lucide-react";
import { OrderModel, OrderStatusType } from "@/models/order";
import { orderRepository } from "@/repositories/orderRepository";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { Toast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store/useStore";
import { OrderStatus } from "@/types";

interface OrdersModuleProps {
  orders: OrderModel[];
  onRefresh: () => void;
  restaurantId?: string;
}

export function OrdersModule({ orders: initialOrders, onRefresh, restaurantId }: OrdersModuleProps) {
  const liveOrders = useStore((state) => state.orders);
  const branches = useStore((state) => state.branches);
  const storeUpdateStatus = useStore((state) => state.updateOrderStatus);
  const cancelOrderStore = useStore((state) => state.cancelOrder);
  const deleteOrderStore = useStore((state) => state.deleteOrder);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accept Order Modal state
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [customPrepMinutes, setCustomPrepMinutes] = useState<number | "">("");

  // Reject Order Modal state
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Kitchen Busy / Out of Stock");

  // Cancel Order Modal state
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("Ordered by mistake");
  const [customReason, setCustomReason] = useState("");
  const [cancellationNote, setCancellationNote] = useState("");

  // Delete Order Modal state
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const cancellationReasonsList = [
    "Ordered by mistake",
    "Changed my mind",
    "Taking too long",
    "Found another option",
    "Incorrect order",
    "Other"
  ];

  const handleConfirmAdminCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId) return;
    setSubmitting(true);
    try {
      const finalReason = cancellationReason === "Other" && customReason.trim() !== "" ? customReason.trim() : cancellationReason;
      const res = await cancelOrderStore(cancellingOrderId, "admin", finalReason, cancellationNote);
      if (!res.success) {
        alert(res.message || "Failed to cancel order.");
      } else {
        setToastMessage("Order cancelled successfully.");
        setCancellingOrderId(null);
        setCancellationReason(cancellationReasonsList[0]);
        setCustomReason("");
        setCancellationNote("");
        if (selectedOrder && selectedOrder.id === cancellingOrderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: "CANCELLED",
            cancelledBy: "admin",
            cancellationReason: finalReason,
            cancellationNote: cancellationNote
          });
        }
        onRefresh();
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
      setToastMessage("Cancelled order removed successfully.");
      setDeletingOrderId(null);
      if (selectedOrder && selectedOrder.id === deletingOrderId) {
        setSelectedOrder(null);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete cancelled order.");
    } finally {
      setSubmitting(false);
    }
  };

  // Merge live store orders with initial repository orders
  const allOrdersList = liveOrders.length > 0 ? liveOrders : (initialOrders as any[]);
  const restaurantOrders = allOrdersList.filter((o) => {
    if (!restaurantId) return true;
    const isDirectRest = o.restaurantId === restaurantId;
    const isBranchRest = o.branchId === restaurantId || branches.some((b) => b.restaurantId === restaurantId && b.id === o.branchId);
    return isDirectRest || isBranchRest;
  });

  const filteredOrders = restaurantOrders.filter((o) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "REJECTED") return o.status === "REJECTED" || o.status === "CANCELLED";
    return o.status === activeFilter;
  });

  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingOrderId) return;
    setSubmitting(true);
    try {
      const finalPrepTime = customPrepMinutes !== "" ? Number(customPrepMinutes) : prepTimeMinutes;
      await storeUpdateStatus(acceptingOrderId, "ACCEPTED", finalPrepTime);
      setToastMessage("Order Accepted successfully!");
      setAcceptingOrderId(null);
      onRefresh();
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
      await storeUpdateStatus(rejectingOrderId, "REJECTED", undefined, rejectionReason);
      setToastMessage("Order Rejected successfully.");
      setRejectingOrderId(null);
      onRefresh();
    } catch (err: any) {
      alert("Failed to reject order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickNextStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (selectedOrder && selectedOrder.status === "CANCELLED") {
      alert("This order has already been cancelled and cannot be updated.");
      return;
    }
    setSubmitting(true);
    try {
      await storeUpdateStatus(orderId, nextStatus);
      setToastMessage(`Order status updated to ${nextStatus.replace(/_/g, " ")}!`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  const getNextStatus = (current: string): OrderStatus | null => {
    switch (current) {
      case "ACCEPTED": return "PREPARING";
      case "PREPARING": return "READY";
      case "READY": return "OUT_FOR_DELIVERY";
      case "OUT_FOR_DELIVERY": return "DELIVERED";
      default: return null;
    }
  };

  const getNextStatusLabel = (current: string): string => {
    switch (current) {
      case "ACCEPTED": return "Start Prep";
      case "PREPARING": return "Mark Ready";
      case "READY": return "Dispatch";
      case "OUT_FOR_DELIVERY": return "Delivered";
      default: return "";
    }
  };

  const statusBadges: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-900 border-amber-300",
    ACCEPTED: "bg-blue-100 text-blue-900 border-blue-300",
    PREPARING: "bg-purple-100 text-purple-900 border-purple-300",
    READY: "bg-teal-100 text-teal-900 border-teal-300",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-900 border-indigo-300",
    DELIVERED: "bg-emerald-100 text-emerald-900 border-emerald-300",
    COMPLETED: "bg-emerald-100 text-emerald-900 border-emerald-300",
    REJECTED: "bg-rose-100 text-rose-900 border-rose-300",
    CANCELLED: "bg-rose-100 text-rose-900 border-rose-300"
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Status Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> Restaurant Live Orders ({restaurantOrders.length})
          </h2>
          <p className="text-xs text-slate-500">Monitor incoming orders, estimated prep times & delivery status</p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-slate-100 rounded-2xl text-xs custom-scrollbar">
          {["ALL", "PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "REJECTED"].map((st) => {
            const count = st === "ALL" 
              ? restaurantOrders.length 
              : st === "REJECTED" 
              ? restaurantOrders.filter(o => o.status === "REJECTED" || o.status === "CANCELLED").length
              : restaurantOrders.filter(o => o.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setActiveFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 ${
                  activeFilter === st ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st.replace(/_/g, " ")} <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded-full text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                  No orders found in this category.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const nextSt = ord.status === "CANCELLED" ? null : getNextStatus(ord.status);
                const isCancellable = ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && ord.status !== "REJECTED";
                const isCancelled = ord.status === "CANCELLED";

                return (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{ord.orderNumber || ord.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      <div>{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{ord.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium text-[11px]">{ord.branchName || ord.branchId}</td>
                    <td className="px-4 py-3 text-slate-600">{ord.items?.length || 0} Items</td>
                    <td className="px-4 py-3 font-black text-slate-900">₹{ord.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusBadges[ord.status] || "bg-slate-100 text-slate-700"}`}>
                        {ord.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PENDING: Accept vs Reject buttons */}
                        {ord.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => {
                                setAcceptingOrderId(ord.id);
                                setPrepTimeMinutes(20);
                                setCustomPrepMinutes("");
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => {
                                setRejectingOrderId(ord.id);
                                setRejectionReason("Kitchen Busy / Out of Stock");
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* ACCEPTED / PREPARING / READY / OUT_FOR_DELIVERY: Next Step button */}
                        {nextSt && (
                          <button
                            onClick={() => handleQuickNextStatus(ord.id, nextSt)}
                            disabled={submitting}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl shadow flex items-center gap-1"
                          >
                            {getNextStatusLabel(ord.status)} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isCancellable && (
                          <button
                            onClick={() => {
                              setCancellingOrderId(ord.id);
                              setCancellationReason(cancellationReasonsList[0]);
                              setCustomReason("");
                              setCancellationNote("");
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200 flex items-center gap-1"
                            title="Cancel Order"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isCancelled && (
                          <button
                            onClick={() => setDeletingOrderId(ord.id)}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl shadow flex items-center gap-1"
                            title="Delete / Remove Cancelled Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
                  {cancellationReasonsList.map((r) => (
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

      {/* Delete Cancelled Order Modal */}
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

      {/* Right Slide Drawer for Order Details */}
      <SlideDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        subtitle={`Branch ID: ${selectedOrder?.branchId}`}
      >
        {selectedOrder && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span>Customer: {selectedOrder.customerName}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusBadges[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-slate-500">Phone: {selectedOrder.customerPhone || "N/A"}</p>
              <p className="text-slate-500">Address: {selectedOrder.customerAddress || "Walk-in / Counter"}</p>

              {selectedOrder.status === "CANCELLED" && (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                  <div className="flex justify-between items-center font-extrabold text-[11px]">
                    <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-rose-600" /> ORDER CANCELLED</span>
                    <span className="capitalize px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[9px]">By: {selectedOrder.cancelledBy || 'Customer'}</span>
                  </div>
                  <p className="text-[11px]"><strong>Reason:</strong> {selectedOrder.cancellationReason || "N/A"}</p>
                  {selectedOrder.cancellationNote && <p className="text-[10.5px] italic text-rose-800"><strong>Note:</strong> {selectedOrder.cancellationNote}</p>}
                  {selectedOrder.cancelledAt && (
                    <p className="text-[9.5px] text-rose-600 font-mono">
                      Time: {new Date(selectedOrder.cancelledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Order Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const baseP = item.basePrice || item.price || 0;
                  const unitP = item.unitPrice || item.price || 0;
                  const qty = item.quantity || 1;
                  const totalItemP = item.itemTotal || item.totalPrice || (unitP * qty);
                  const addonsP = unitP > baseP ? unitP - baseP : 0;
                  const variantStr = typeof item.selectedVariant === 'string' 
                    ? item.selectedVariant 
                    : item.selectedVariant?.name || item.size || null;

                  return (
                    <div key={idx} className="p-3 space-y-1.5 border-b border-slate-100 last:border-none">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-800">{qty}x {item.productName || item.name || item.comboName || 'Item'}</p>
                            {(item.isCombo || item.comboName || item.itemType === 'combo') && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[9px] rounded">
                                COMBO{item.comboName ? `: ${item.comboName}` : ""}
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

                      {/* Combo Selections */}
                      {item.selectedComboOptions && item.selectedComboOptions.length > 0 && (
                        <div className="text-[10px] text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-xl space-y-0.5 font-medium">
                          <p className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">Selected Combo Options:</p>
                          {item.selectedComboOptions.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="flex justify-between text-[10px]">
                              <span>• {opt.categoryName || opt.groupName || 'Option'}: <strong>{opt.optionName || opt.name}</strong></span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Customizations / Addons / Notes */}
                      {(item.customizationSelections?.length > 0 || (item.customizations && item.customizations.length > 0) || item.removedItems?.length > 0 || item.replacements?.length > 0 || item.selectedAddons?.length > 0) && (
                        <div className="text-[10px] text-amber-900 bg-amber-50/90 border border-amber-200/80 p-2 rounded-xl space-y-1 font-medium">
                          <div className="flex justify-between items-center text-[9.5px] font-bold text-amber-900 border-b border-amber-200/60 pb-0.5">
                            <span>Customizations & Add-ons</span>
                            <span>Base: ₹{baseP}{addonsP > 0 ? ` + Add-ons: ₹${addonsP}` : ''}</span>
                          </div>
                          {item.customizationSelections && item.customizationSelections.length > 0 ? (
                            item.customizationSelections.map((c: any, cIdx: number) => (
                              <div key={cIdx} className="flex justify-between">
                                <span>• {c.groupName || 'Option'}: <strong>{c.optionName || c.name}</strong></span>
                                <span className="font-semibold text-amber-800">+{c.additionalPrice > 0 ? `₹${c.additionalPrice}` : 'Free'}</span>
                              </div>
                            ))
                          ) : (
                            item.customizations?.map((c: string, cIdx: number) => (
                              <div key={cIdx}>• {c}</div>
                            ))
                          )}
                          {item.removedItems?.length > 0 && <p className="text-rose-700 font-semibold">Removed: {item.removedItems.join(', ')}</p>}
                          {item.replacements?.length > 0 && <p className="text-amber-800 font-semibold">Replacements: {item.replacements.join(', ')}</p>}
                          {item.selectedAddons?.length > 0 && <p className="text-blue-800 font-semibold">Add-ons: {item.selectedAddons.join(', ')}</p>}
                          <div className="text-[9.5px] font-bold text-amber-900 pt-0.5 border-t border-amber-200/60 text-right">
                            Final Unit Price: ₹{unitP} × {qty} = ₹{totalItemP}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Change Actions */}
            {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "REJECTED" && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickNextStatus(selectedOrder.id, "ACCEPTED")}
                    disabled={submitting}
                    className="px-3 py-2 bg-blue-600 text-white font-bold rounded-xl shadow text-xs flex items-center justify-center gap-1"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => handleQuickNextStatus(selectedOrder.id, "PREPARING")}
                    disabled={submitting}
                    className="px-3 py-2 bg-purple-600 text-white font-bold rounded-xl shadow text-xs flex items-center justify-center gap-1"
                  >
                    Start Preparing
                  </button>
                  <button
                    onClick={() => handleQuickNextStatus(selectedOrder.id, "READY")}
                    disabled={submitting}
                    className="px-3 py-2 bg-teal-600 text-white font-bold rounded-xl shadow text-xs flex items-center justify-center gap-1"
                  >
                    Mark Ready
                  </button>
                  <button
                    onClick={() => handleQuickNextStatus(selectedOrder.id, "DELIVERED")}
                    disabled={submitting}
                    className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow text-xs flex items-center justify-center gap-1"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => {
                      setCancellingOrderId(selectedOrder.id);
                      setCancellationReason(cancellationReasonsList[0]);
                      setCustomReason("");
                      setCancellationNote("");
                    }}
                    disabled={submitting}
                    className="px-3 py-2 bg-rose-600 text-white font-bold rounded-xl shadow text-xs col-span-2 flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                </div>
              </div>
            )}

            {selectedOrder.status === "CANCELLED" && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setDeletingOrderId(selectedOrder.id)}
                  disabled={submitting}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete / Remove Cancelled Order
                </button>
              </div>
            )}
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
