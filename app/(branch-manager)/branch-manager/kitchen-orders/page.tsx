"use client";

import React, { useState } from "react";
import { 
  UtensilsCrossed, 
  Search, 
  Printer, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  FileText, 
  Flame, 
  ChevronRight,
  MapPin,
  Building2
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { KitchenTicketModal } from "@/components/kitchen/KitchenTicketModal";
import { OrderInvoiceModal } from "@/components/invoice/OrderInvoiceModal";
import { formatInvoiceDate, formatInvoiceTime } from "@/lib/utils/invoiceUtils";

export default function BranchManagerKitchenOrdersPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);

  const assignedBranchId = user?.branchId || user?.assignedBranchId || "";
  const assignedBranch = branches.find((b) => b.id === assignedBranchId) || branches[0];

  const [activeTab, setActiveTab] = useState<string>("KITCHEN_ACTIVE");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [kotOrder, setKotOrder] = useState<any>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // STRICT BRANCH ISOLATION:
  // Filter orders strictly belonging to assigned branch only!
  const myBranchOrders = orders.filter((ord) => {
    if (assignedBranchId && ord.branchId && ord.branchId !== assignedBranchId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = (ord.orderNumber || ord.id).toLowerCase().includes(q);
      const matchCust = (ord.customerName || "").toLowerCase().includes(q);
      const matchPhone = (ord.customerPhone || "").toLowerCase().includes(q);
      return matchNum || matchCust || matchPhone;
    }
    return true;
  });

  // Filter by Tab
  const finalOrders = myBranchOrders.filter((ord) => {
    const st = (ord.status || "").toUpperCase();
    if (activeTab === "KITCHEN_ACTIVE") {
      return st === "PENDING" || st === "ACCEPTED" || st === "PREPARING";
    }
    if (activeTab === "READY") {
      return st === "READY" || st === "OUT_FOR_DELIVERY";
    }
    if (activeTab === "COMPLETED") {
      return st === "DELIVERED" || st === "COMPLETED";
    }
    return true; // ALL
  });

  const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus as any);
    } catch (e) {
      console.warn("Status update notice:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (currentStatus: string): { status: string; label: string } | null => {
    const st = (currentStatus || "").toUpperCase();
    if (st === "PENDING") return { status: "ACCEPTED", label: "Accept Order" };
    if (st === "ACCEPTED") return { status: "PREPARING", label: "Start Preparing 🍳" };
    if (st === "PREPARING") return { status: "READY", label: "Mark Ready 📦" };
    if (st === "READY") return { status: "OUT_FOR_DELIVERY", label: "Dispatch / Out 🛵" };
    if (st === "OUT_FOR_DELIVERY") return { status: "DELIVERED", label: "Complete / Delivered 🎉" };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30 mb-2">
            <Building2 className="w-3.5 h-3.5" /> Branch Kitchen Display Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {assignedBranch?.name || "Branch"} Kitchen Queue
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Live kitchen preparation tickets strictly scoped to {assignedBranch?.name || "your branch"}.
          </p>
        </div>

        <div className="px-4 py-2 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs flex items-center gap-2 shrink-0">
          <UtensilsCrossed className="w-4 h-4" /> Live Kitchen Printing
        </div>
      </div>

      {/* Control Bar: Search & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "KITCHEN_ACTIVE", label: "Active Kitchen", icon: Flame, color: "bg-amber-500 text-slate-950" },
            { id: "READY", label: "Ready / Out", icon: Clock, color: "bg-blue-600 text-white" },
            { id: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "bg-emerald-600 text-white" },
            { id: "ALL", label: "All Branch Orders", icon: ShoppingBag, color: "bg-slate-900 text-white" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const count = myBranchOrders.filter((ord) => {
              const st = (ord.status || "").toUpperCase();
              if (tab.id === "KITCHEN_ACTIVE") return st === "PENDING" || st === "ACCEPTED" || st === "PREPARING";
              if (tab.id === "READY") return st === "READY" || st === "OUT_FOR_DELIVERY";
              if (tab.id === "COMPLETED") return st === "DELIVERED" || st === "COMPLETED";
              return true;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                  isActive
                    ? `${tab.color} shadow-md`
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-black/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order # or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Orders Grid / Queue */}
      {finalOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Kitchen Orders for {assignedBranch?.name || "Branch"}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No orders match the active kitchen queue filter for your assigned branch. New orders placed by customers in your delivery zone will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {finalOrders.map((ord) => {
            const orderNum = ord.orderNumber || ord.id;
            const orderDate = formatInvoiceDate(ord.createdAt);
            const orderTime = formatInvoiceTime(ord.createdAt);
            const isTakeAway = (ord.orderType || "").toUpperCase().includes("TAKE");
            const nextAction = getNextStatus(ord.status);
            const isCancelled = ord.status === "CANCELLED" || ord.status === "REJECTED";

            return (
              <div
                key={ord.id}
                className={`bg-white rounded-2xl border ${
                  ord.status === "PENDING"
                    ? "border-amber-400 ring-2 ring-amber-400/20"
                    : "border-slate-200/90"
                } shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden`}
              >
                {/* Order Header */}
                <div className="p-4 bg-slate-900 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                      #{orderNum}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isTakeAway
                          ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-400/40"
                      }`}
                    >
                      {isTakeAway ? "🛍️ TAKE AWAY" : "🛵 DELIVERY"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {ord.branchName || assignedBranch?.name || "Branch"}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {orderDate} @ {orderTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2 text-slate-200 font-semibold">
                    <span>Cust: <strong>{ord.customerName || "Customer"}</strong></span>
                    {ord.customerPhone && <span className="font-mono text-slate-400">{ord.customerPhone}</span>}
                  </div>
                </div>

                {/* Preparation Items List */}
                <div className="p-4 space-y-3 flex-1 bg-slate-50/50">
                  <div className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-200 pb-1 flex justify-between">
                    <span>Item & Customization Details</span>
                    <span>Qty</span>
                  </div>

                  <div className="space-y-3 divide-y divide-slate-200/60">
                    {ord.items?.map((it: any, idx: number) => {
                      const isCombo = it.isCombo || it.itemType === "combo" || Boolean(it.comboName);
                      const itemName = it.productName || it.name || it.comboName || "Ordered Item";
                      const qty = it.quantity || 1;
                      const variantStr = typeof it.selectedVariant === "string" ? it.selectedVariant : it.selectedVariant?.name || it.selectedSize || it.size;
                      const customizations = it.customizationSelections || [];
                      const customStrings = it.customizations || [];
                      const comboOptions = it.selectedComboOptions || [];
                      const removedItems = it.removedItems || [];
                      const addons = it.selectedAddons || [];
                      const itemNotes = it.customInstructions || "";

                      return (
                        <div key={idx} className={idx > 0 ? "pt-2.5" : ""}>
                          <div className="flex justify-between items-start text-xs font-bold text-slate-900">
                            <span className="max-w-[80%] uppercase font-extrabold">
                              {itemName}
                              {isCombo && (
                                <span className="ml-1.5 px-1 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black rounded uppercase">
                                  COMBO
                                </span>
                              )}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-900 text-white font-black rounded text-xs shrink-0">
                              x {qty}
                            </span>
                          </div>

                          {variantStr && (
                            <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                              Size/Variant: <strong className="text-slate-900">{variantStr}</strong>
                            </p>
                          )}

                          {/* Combo Options Details */}
                          {comboOptions.length > 0 && (
                            <div className="mt-1 p-1.5 bg-amber-50 border-l-2 border-amber-500 text-[10.5px] rounded text-slate-800 space-y-0.5 font-medium">
                              {comboOptions.map((opt: any, oIdx: number) => (
                                <p key={oIdx}>
                                  • {opt.categoryName || opt.groupName || "Option"}: <strong>{opt.optionName || opt.name}</strong>
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Customizations */}
                          {customizations.length > 0 && (
                            <div className="mt-1 p-1.5 bg-slate-100 border-l-2 border-slate-700 text-[10.5px] rounded text-slate-800 space-y-0.5 font-medium">
                              {customizations.map((c: any, cIdx: number) => (
                                <p key={cIdx}>
                                  • {c.groupName || "Customization"}: <strong>{c.optionName || c.name}</strong>
                                </p>
                              ))}
                            </div>
                          )}

                          {customizations.length === 0 && customStrings.length > 0 && (
                            <div className="mt-1 text-[10.5px] text-slate-600 font-medium">
                              {customStrings.map((cStr: string, cIdx: number) => (
                                <p key={cIdx}>• {cStr}</p>
                              ))}
                            </div>
                          )}

                          {addons.length > 0 && (
                            <p className="text-[10.5px] font-bold text-blue-700 mt-0.5">
                              + Add-ons: {addons.join(", ")}
                            </p>
                          )}

                          {removedItems.length > 0 && (
                            <p className="text-[10.5px] font-bold text-rose-600 mt-0.5">
                              🚫 Remove: {removedItems.join(", ")}
                            </p>
                          )}

                          {itemNotes && (
                            <p className="text-[10.5px] font-semibold text-orange-900 bg-orange-50 p-1 rounded mt-1 italic border border-orange-200">
                              Note: "{itemNotes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Order-level Instructions */}
                  {(ord.instructions || ord.deliveryInstructions) && (
                    <div className="p-2 bg-amber-100/80 border border-amber-300 rounded-xl text-xs space-y-0.5 text-amber-950">
                      <p className="font-bold uppercase text-[10px]">Kitchen Note:</p>
                      <p className="italic font-semibold">"{ord.instructions || ord.deliveryInstructions}"</p>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setKotOrder(ord)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print KOT
                    </button>

                    <button
                      onClick={() => setInvoiceOrder(ord)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="View Customer Bill"
                    >
                      <FileText className="w-3.5 h-3.5" /> Bill
                    </button>
                  </div>

                  {/* Status Advance Button */}
                  {nextAction && !isCancelled && (
                    <button
                      onClick={() => handleStatusUpdate(ord.id, nextAction.status)}
                      disabled={updatingId === ord.id}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {nextAction.label} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KOT Modal Popup */}
      {kotOrder && (
        <KitchenTicketModal
          order={kotOrder}
          branch={assignedBranch || branches.find((b) => b.id === kotOrder.branchId)}
          onClose={() => setKotOrder(null)}
        />
      )}

      {/* Customer Invoice Modal Popup */}
      {invoiceOrder && (
        <OrderInvoiceModal
          order={invoiceOrder}
          branch={assignedBranch || branches.find((b) => b.id === invoiceOrder.branchId)}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
