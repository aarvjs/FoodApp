"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Compass,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Navigation,
  Sparkles,
  History,
  Store
} from "lucide-react";
import { EnrichedCustomer } from "@/lib/utils/customerHelper";

interface CustomerDetailsModalProps {
  customer: EnrichedCustomer | null;
  onClose: () => void;
}

export function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "restaurants" | "addresses" | "timeline">("overview");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [imageError, setImageError] = useState(false);

  if (!customer) return null;

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = customer.customerOrders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      o.id.toLowerCase().includes(q) ||
      (o.branchName && o.branchName.toLowerCase().includes(q)) ||
      (o.customerAddress && o.customerAddress.toLowerCase().includes(q)) ||
      o.items.some((item) => item.productName.toLowerCase().includes(q))
    );
  });

  const hasValidProfileImage = customer.profileImage && !imageError;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 relative">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-800 text-emerald-400 font-black text-xl uppercase flex items-center justify-center shrink-0 shadow-md">
              {hasValidProfileImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={customer.profileImage}
                  alt={customer.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{customer.name ? customer.name.substring(0, 2) : "CU"}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-white tracking-tight">{customer.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    customer.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {customer.phone}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {customer.registeredDate ? new Date(customer.registeredDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:static p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {[
            { id: "overview", label: "Overview & Analytics", icon: Wallet },
            { id: "orders", label: `Order History (${customer.totalOrders})`, icon: ShoppingBag },
            { id: "restaurants", label: `Restaurants (${customer.assignedRestaurantCount})`, icon: Store },
            { id: "addresses", label: `Delivery Addresses (${customer.savedAddresses.length})`, icon: MapPin },
            { id: "timeline", label: "Customer Timeline", icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-xl"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-6">
          {/* TAB 1: OVERVIEW & PROFILE & REVENUE ANALYTICS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" /> Profile Information
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">ID: {customer.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{customer.name}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                    <span className="font-bold text-slate-900 mt-0.5 block font-mono">{customer.phone}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Date</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {customer.registeredDate ? new Date(customer.registeredDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Saved Address</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block truncate" title={customer.currentSavedAddress}>
                      {customer.currentSavedAddress}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City & State</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {customer.city}, {customer.state}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pincode</span>
                    <span className="font-bold text-slate-900 mt-0.5 block font-mono">{customer.pincode}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GPS Coordinates (Lat / Lng)</span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono font-semibold text-slate-800">
                      <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{customer.latitude.toFixed(4)}° N, {customer.longitude.toFixed(4)}° E</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Analytics Cards */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-emerald-600" /> Revenue & Spending Analytics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Card 1: Total Orders */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
                      <div className="text-2xl font-black text-slate-900">{customer.totalOrders}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Placed order count</div>
                    </div>
                  </div>

                  {/* Card 2: Total Revenue Generated */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue Generated</div>
                      <div className="text-2xl font-black text-emerald-600">₹{customer.totalSpent.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Gross revenue from user</div>
                    </div>
                  </div>

                  {/* Card 3: Average Order Value */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Order Value</div>
                      <div className="text-2xl font-black text-slate-900">₹{customer.avgOrderValue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Per order average spend</div>
                    </div>
                  </div>

                  {/* Card 4: Highest Order Value */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Order Value</div>
                      <div className="text-2xl font-black text-amber-600">₹{customer.highestOrderValue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Single max ticket size</div>
                    </div>
                  </div>

                  {/* Card 5: Completed Orders */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Orders</div>
                      <div className="text-2xl font-black text-slate-900">{customer.completedOrdersCount}</div>
                      <div className="text-[10px] text-teal-600 font-semibold">Successfully delivered</div>
                    </div>
                  </div>

                  {/* Card 6: Cancelled Orders */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cancelled Orders</div>
                      <div className="text-2xl font-black text-slate-900">{customer.cancelledOrdersCount}</div>
                      <div className="text-[10px] text-rose-600 font-semibold">Cancelled or rejected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" /> Complete Order History ({customer.customerOrders.length})
                  </h3>
                  <p className="text-xs text-slate-500">View details, payment status, and ordered items for all past purchases</p>
                </div>

                <input
                  type="text"
                  placeholder="Filter orders by ID, items, branch..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-64 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No orders found for this customer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
                    const isExpanded = expandedOrderId === ord.id;
                    return (
                      <div
                        key={ord.id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                      >
                        {/* Summary Bar */}
                        <div
                          onClick={() => toggleExpandOrder(ord.id)}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              #{ord.orderNumber || ord.id.substring(0, 6)}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs">
                                  {ord.branchName || "Restaurant Branch"}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                                  {ord.orderType || "DELIVERY"}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    ord.status === "DELIVERED"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : ord.status === "CANCELLED" || ord.status === "REJECTED"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(ord.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                            <div className="text-right">
                              <div className="text-sm font-black text-emerald-600">₹{ord.totalAmount}</div>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  ord.paymentStatus === "PAID"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {ord.paymentStatus} ({ord.paymentMethod})
                              </span>
                            </div>

                            <button className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Items Section */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3 text-xs">
                            <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                              <span>Ordered Items ({ord.items?.length || 0})</span>
                              <span className="text-[11px] font-normal text-slate-500">
                                Delivery Address: {ord.customerAddress || customer.currentSavedAddress}
                              </span>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100/70 text-slate-500 uppercase font-bold text-[9px]">
                                  <tr>
                                    <th className="px-3 py-2">Product Name</th>
                                    <th className="px-3 py-2 text-center">Quantity</th>
                                    <th className="px-3 py-2 text-right">Price</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  {ord.items.map((item, i) => (
                                    <tr key={i}>
                                      <td className="px-3 py-2 font-semibold text-slate-800">
                                        {item.productName}
                                        {item.customizations && item.customizations.length > 0 && (
                                          <div className="text-[10px] text-slate-400">
                                            {item.customizations.join(", ")}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-center font-bold">{item.quantity}</td>
                                      <td className="px-3 py-2 text-right text-slate-600">₹{item.price}</td>
                                      <td className="px-3 py-2 text-right font-bold text-slate-900">
                                        ₹{item.price * item.quantity}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="flex justify-end gap-6 text-[11px] font-medium text-slate-600 pt-1">
                              <span>Subtotal: ₹{ord.subtotal}</span>
                              <span>Tax: ₹{ord.tax}</span>
                              <span>Delivery Fee: ₹{ord.deliveryFee}</span>
                              <span className="font-bold text-slate-900 text-xs">
                                Grand Total: ₹{ord.totalAmount}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESTAURANT ANALYTICS */}
          {activeTab === "restaurants" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" /> Restaurant Analytics
                </h3>
                <p className="text-xs text-slate-500">Breakdown of order frequency & revenue generated per restaurant branch</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Restaurant Name</th>
                      <th className="px-4 py-3">Branch Name</th>
                      <th className="px-4 py-3 text-center">Number of Orders</th>
                      <th className="px-4 py-3 text-right">Total Revenue</th>
                      <th className="px-4 py-3 text-right pr-6">Last Order Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {customer.restaurantAnalytics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          No restaurant order analytics recorded.
                        </td>
                      </tr>
                    ) : (
                      customer.restaurantAnalytics.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">{res.restaurantName}</td>
                          <td className="px-4 py-3 text-slate-600">{res.branchName}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-full text-xs">
                              {res.orderCount} Orders
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-600">
                            ₹{res.totalRevenue.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right pr-6 text-slate-500">
                            {new Date(res.lastOrderDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY ADDRESS HISTORY */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address History
                  </h3>
                  <p className="text-xs text-slate-500">Saved addresses & historical delivery destinations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white border rounded-2xl p-4 shadow-xs relative space-y-3 transition-all ${
                      addr.isDefault
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {addr.label || "Saved Address"}
                      </span>

                      {addr.isDefault && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                          CURRENT DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{addr.fullAddress}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {addr.city}, {addr.state} ({addr.pincode})
                      </span>

                      <span className="font-mono flex items-center gap-1 text-slate-600">
                        <Navigation className="w-3 h-3 text-slate-400" />
                        {addr.latitude?.toFixed(4)}, {addr.longitude?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" /> Customer Activity Timeline
                </h3>
                <p className="text-xs text-slate-500">Chronological history of account milestones & interactions</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                  {customer.timeline.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-xs">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
