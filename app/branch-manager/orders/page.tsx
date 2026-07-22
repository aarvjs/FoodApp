"use client";

import React, { useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAppStore } from "@/lib/store/useAppStore";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  ChefHat,
  Truck,
  Phone,
  MapPin,
  XCircle,
  ShieldCheck,
} from "lucide-react";

export default function BranchManagerOrdersPage() {
  const { branchManagerUser } = useAuthStore();
  const { orders, updateOrderStatus, assignDeliveryBoy, deliveryBoys } = useAppStore();

  const assignedBranchId = branchManagerUser?.assignedBranchId || "branch-kanpur";
  const assignedBranchName = branchManagerUser?.assignedBranchName || "Kanpur Branch";

  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // STRICT BRANCH SCOPED DATA FILTERING
  const branchOrders = orders.filter((ord) => {
    const isAssignedBranch = ord.branchId === assignedBranchId;
    const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ord.customerPhone.includes(searchFilter);

    return isAssignedBranch && matchesStatus && matchesSearch;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-amber-400" />
            <span>{assignedBranchName} Orders</span>
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Strictly scoped live orders for {assignedBranchName} only
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
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by Order ID, Customer, Phone..."
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <span className="text-xs font-semibold text-stone-400">
            {assignedBranchName} Total: {branchOrders.length} orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Rider</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 font-medium">
              {branchOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-stone-500">
                    No orders found for {assignedBranchName} matching filter criteria.
                  </td>
                </tr>
              ) : (
                branchOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-500">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-stone-300">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-400">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={ord.paymentStatus === "PAID" ? "success" : "warning"}>
                        {ord.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(ord.status)}>
                        {ord.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-300">
                      {ord.deliveryBoyName || <span className="text-stone-500 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
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
          title={`Branch Order: ${selectedOrder.orderNumber}`}
          subtitle={`${selectedOrder.branchName} Branch • Placed at ${formatDate(selectedOrder.createdAt)}`}
          maxWidth="xl"
        >
          <div className="space-y-6 text-stone-900">
            {/* Status Bar */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 font-medium block">Order Status</span>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="mt-1">
                  {selectedOrder.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status === "PENDING" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "PREPARING");
                      setSelectedOrder({ ...selectedOrder, status: "PREPARING" });
                    }}
                    className="px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl"
                  >
                    Send to Kitchen
                  </button>
                )}
                {selectedOrder.status === "PREPARING" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "READY");
                      setSelectedOrder({ ...selectedOrder, status: "READY" });
                    }}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2.5 bg-stone-50 rounded-xl text-xs font-semibold">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
