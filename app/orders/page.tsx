"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  MapPin,
  CreditCard,
  UserCheck,
  ChefHat,
  XCircle,
} from "lucide-react";

export default function OrdersPage() {
  const {
    orders,
    selectedBranchId,
    updateOrderStatus,
    assignDeliveryBoy,
    deliveryBoys,
  } = useAppStore();

  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter logic
  const filteredOrders = orders.filter((ord) => {
    const matchesBranch =
      selectedBranchId === "ALL" || ord.branchId === selectedBranchId;
    const matchesStatus =
      statusFilter === "ALL" || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ord.customerPhone.includes(searchFilter);
    return matchesBranch && matchesStatus && matchesSearch;
  });

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "PREPARING":
        return "warning";
      case "READY":
        return "info";
      case "OUT_FOR_DELIVERY":
        return "primary";
      case "CANCELLED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Monitor live customer orders, update statuses, & dispatch deliveries
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {["ALL", "PENDING", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-[#FF6B35] text-white shadow-sm shadow-orange-500/20"
                    : "bg-white text-stone-600 border border-stone-200/80 hover:bg-orange-50"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-3xl bg-white border border-orange-100/80 overflow-hidden shadow-sm">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by Order ID, Customer, Phone..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <span className="text-xs font-semibold text-stone-500">
            Showing {filteredOrders.length} orders
          </span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FFFDF8] border-b border-stone-100 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Delivery Agent</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-stone-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-orange-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-extrabold text-stone-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">
                        {ord.customerName}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {ord.customerPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">
                      {ord.branchName}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#FF6B35]">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={ord.paymentStatus === "PAID" ? "success" : "warning"}>
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(ord.status)}>
                        {ord.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600">
                      {ord.deliveryBoyName ? (
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-orange-500" />
                          <span>{ord.deliveryBoyName}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6B35] font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder.orderNumber}`}
          subtitle={`Placed at ${formatDate(selectedOrder.createdAt)} • ${selectedOrder.branchName} Branch`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Status Workflow Action Bar */}
            <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 font-medium block">
                  Current Status
                </span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="mt-1">
                  {selectedOrder.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Status Updater Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedOrder.status === "PENDING" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "PREPARING");
                      setSelectedOrder({ ...selectedOrder, status: "PREPARING" });
                    }}
                    className="px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Send to Kitchen</span>
                  </button>
                )}

                {selectedOrder.status === "PREPARING" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "READY");
                      setSelectedOrder({ ...selectedOrder, status: "READY" });
                    }}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Ready</span>
                  </button>
                )}

                {selectedOrder.status === "READY" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "OUT_FOR_DELIVERY");
                      setSelectedOrder({ ...selectedOrder, status: "OUT_FOR_DELIVERY" });
                    }}
                    className="px-3 py-1.5 bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Order</span>
                  </button>
                )}

                {selectedOrder.status !== "DELIVERED" && selectedOrder.status !== "CANCELLED" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "CANCELLED");
                      setSelectedOrder({ ...selectedOrder, status: "CANCELLED" });
                    }}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400">
                  Customer Info
                </span>
                <p className="font-bold text-stone-900 text-xs mt-1">
                  {selectedOrder.customerName}
                </p>
                <div className="flex items-center gap-1 text-xs text-stone-600 mt-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400">
                  Delivery Destination & OTP
                </span>
                <p className="text-xs text-stone-700 font-medium mt-1 truncate">
                  {selectedOrder.customerAddress || "Takeaway / Dining"}
                </p>
                {selectedOrder.otp && (
                  <p className="text-xs font-bold text-[#FF6B35] mt-1">
                    Delivery OTP: <span className="underline">{selectedOrder.otp}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Agent Assignment Dropdown */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  Assign Delivery Agent
                </span>
                <span className="text-[11px] text-stone-400">
                  Assigned: {selectedOrder.deliveryBoyName || "None"}
                </span>
              </div>
              <select
                value={selectedOrder.deliveryBoyId || ""}
                onChange={(e) => {
                  assignDeliveryBoy(selectedOrder.id, e.target.value);
                  setSelectedOrder({
                    ...selectedOrder,
                    deliveryBoyId: e.target.value,
                    deliveryBoyName: deliveryBoys.find((d) => d.id === e.target.value)?.name,
                    status: "OUT_FOR_DELIVERY",
                  });
                }}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
              >
                <option value="">Select Delivery Agent</option>
                {deliveryBoys.map((db) => (
                  <option key={db.id} value={db.id}>
                    {db.name} ({db.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items Breakdown */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900">
                      {formatCurrency(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal Calculation */}
            <div className="p-4 bg-[#FFFDF8] rounded-2xl border border-orange-100 space-y-1.5 text-xs font-medium">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST & Taxes</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-orange-200 text-sm font-extrabold text-[#FF6B35]">
                <span>Grand Total</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
