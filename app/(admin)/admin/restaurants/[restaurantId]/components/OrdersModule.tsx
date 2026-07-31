"use client";

import React, { useState } from "react";
import { ShoppingBag, Eye, Clock, CheckCircle2, XCircle, ChevronRight, Check, Loader2 } from "lucide-react";
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
    setSubmitting(true);
    try {
      await storeUpdateStatus(orderId, nextStatus);
      setToastMessage(`Order status updated to ${nextStatus.replace(/_/g, " ")}!`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
      onRefresh();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
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
                const nextSt = getNextStatus(ord.status);
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
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Order Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{item.productName || item.name} × {item.quantity}</p>
                      <p className="text-[10px] text-slate-400">₹{item.price} each</p>
                    </div>
                    <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Change Actions */}
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
              </div>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
