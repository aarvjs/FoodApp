"use client";

import React from "react";
import { Coins, MapPin, Phone, Clock, FileText, CheckCircle2, ShieldCheck, Tag, ShoppingBag, Receipt, AlertCircle, RefreshCw } from "lucide-react";
import {
  getOrGenerateInvoiceNumber,
  formatInvoiceCurrency,
  formatInvoiceDate,
  formatInvoiceTime,
  formatInvoiceDateTime,
} from "@/lib/utils/invoiceUtils";

interface OrderInvoiceViewProps {
  order: any;
  branch?: any;
  restaurant?: any;
}

export const OrderInvoiceView: React.FC<OrderInvoiceViewProps> = ({
  order,
  branch,
  restaurant,
}) => {
  if (!order) return null;

  const invoiceNum = getOrGenerateInvoiceNumber(order);
  const orderDate = formatInvoiceDate(order.createdAt);
  const orderTime = formatInvoiceTime(order.createdAt);
  const billGeneratedTime = formatInvoiceDateTime(new Date());

  const restaurantName =
    order.restaurantName ||
    restaurant?.name ||
    branch?.restaurantName ||
    "Food Restaurant";

  const branchName =
    order.branchName || branch?.name || "Main Branch";

  const branchAddress =
    branch?.address ||
    branch?.location?.formattedAddress ||
    restaurant?.address ||
    order.branchAddress ||
    "Branch Office Location Configured";

  const branchPhone =
    branch?.phone ||
    branch?.managerPhone ||
    restaurant?.phone ||
    "+91 98765 43210";

  const rawFssai =
    order.branchFssaiNumber ||
    order.fssaiNumber ||
    order.fssai ||
    branch?.fssaiNumber ||
    branch?.fssai ||
    restaurant?.fssaiNumber ||
    restaurant?.fssai ||
    "";

  const fssaiNo = rawFssai
    ? rawFssai.toUpperCase().includes("FSSAI")
      ? rawFssai
      : `FSSAI Lic. No.: ${rawFssai}`
    : null;

  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED";
  const isPaid =
    order.paymentStatus === "SUCCESS" ||
    order.paymentStatus === "PAID" ||
    order.paymentStatus === "COMPLETED";

  const subtotal = Number(order.subtotal || 0);
  const couponDiscount = Number(order.discount || 0);
  const rewardDiscount = Number(order.rewardDiscountAmount || 0);
  const rewardPointsUsed = Number(order.rewardPointsUsed || 0);
  const deliveryFee = Number(order.deliveryFee || order.deliveryCharge || 0);
  const handlingCharge = Number(order.handlingCharge || 0);
  const packagingCharge = Number(order.packagingCharge || 0);
  const tax = Number(order.tax || 0);
  const taxPct = Number(order.taxPercentage || order.gstPercentage || 0);
  const grandTotal = Number(order.totalAmount || order.grandTotal || 0);

  const rawGst =
    order.branchGstNumber ||
    order.gstNumber ||
    order.gst ||
    branch?.gstNumber ||
    branch?.gst ||
    restaurant?.gstNumber ||
    restaurant?.gst ||
    "";

  const gstNo = rawGst
    ? rawGst.toUpperCase().includes("GSTIN")
      ? rawGst
      : `GSTIN: ${rawGst}`
    : null;

  return (
    <div
      id={`invoice-print-area-${order.id}`}
      className="bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-3xl mx-auto border border-slate-200 rounded-2xl shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full"
    >
      {/* ── 1. TAX INVOICE HEADER ────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm print:bg-slate-900">
              {restaurantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {restaurantName}
              </h1>
              <p className="text-xs font-bold text-amber-700">{branchName}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="px-3 py-1 bg-slate-900 text-white font-black text-xs rounded-lg uppercase tracking-wider inline-block">
              TAX INVOICE / BILL
            </span>
            <div className="mt-1 font-mono font-black text-sm text-slate-800">
              {invoiceNum}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Generated: {billGeneratedTime}
            </p>
          </div>
        </div>

        {/* Branch Info Strip */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {branchAddress}
            </p>
            <p className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {branchPhone}
            </p>
          </div>
          <div className="sm:text-right">
            {gstNo && (
              <p className="font-mono text-[11px] font-bold text-slate-800">
                {gstNo}
              </p>
            )}
            {fssaiNo && (
              <p className="font-mono text-[11px] font-bold text-slate-700">
                {fssaiNo}
              </p>
            )}
            <p className="text-[10.5px] text-slate-500">
              Order ID: <strong className="text-slate-800 font-mono">{order.id}</strong>
            </p>
          </div>
        </div>
      </div>


      {/* ── 2. CUSTOMER & ORDER SUMMARY STRIP ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-5">
        {/* Customer Details */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Customer Information
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            {order.customerName || "Walk-in Customer"}
          </h3>
          <p className="text-slate-600 font-mono">{order.customerPhone || "N/A"}</p>
          {order.customerAddress && (
            <p className="text-slate-700 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200/60">
              <strong>Delivery Address:</strong> {order.customerAddress}
            </p>
          )}
          {(order.deliveryInstructions || order.instructions) && (
            <p className="text-amber-800 text-[11px] italic bg-amber-50 p-1.5 rounded border border-amber-200">
              <strong>Instructions:</strong> "{order.deliveryInstructions || order.instructions}"
            </p>
          )}
        </div>

        {/* Order Details & Status */}
        <div className="space-y-1.5 sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Order Metadata
          </span>
          <div>
            <p className="font-mono font-bold text-slate-900 text-sm">
              Order #{order.orderNumber || order.id}
            </p>
            <p className="text-slate-500 font-medium">
              Order Date: <strong>{orderDate}</strong> at <strong>{orderTime}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center sm:justify-end gap-2 pt-1">
            <span
              className={`px-2.5 py-0.5 font-bold text-[10.5px] rounded-md uppercase border ${
                order.orderType === "TAKE_AWAY" || order.orderType === "TAKEAWAY"
                  ? "bg-purple-100 text-purple-900 border-purple-300 font-extrabold"
                  : "bg-slate-100 text-slate-800 border-slate-300"
              }`}
            >
              {order.orderType === "TAKE_AWAY" || order.orderType === "TAKEAWAY"
                ? "TAKE AWAY / SELF PICKUP"
                : order.orderType || "DELIVERY"}
            </span>

            <span
              className={`px-2.5 py-0.5 font-extrabold text-[10.5px] rounded-md uppercase border ${
                isCancelled
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : order.status === "DELIVERED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              Status: {String(order.status || "PENDING").replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. ORDER ITEMS TABLE ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Itemized Order Details
        </h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Item & Description</th>
                <th className="px-3 py-2.5 text-center">Qty</th>
                <th className="px-3 py-2.5 text-right">Price</th>
                <th className="px-3 py-2.5 text-right pr-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((it: any, idx: number) => {
                const isComboItem = it.isCombo || it.itemType === "combo" || Boolean(it.comboName);
                const baseP = Number(it.basePrice || it.price || 0);
                const unitP = Number(it.unitPrice || it.price || 0);
                const qty = Number(it.quantity || 1);
                const totalItemP = Number(it.totalPrice || it.itemTotal || unitP * qty);
                const addonsP = unitP > baseP ? unitP - baseP : 0;
                const variantSize = it.selectedVariant?.name || it.selectedSize || it.size;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 space-y-1">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                        <span>{it.productName || it.name || it.comboName || 'Item'}</span>
                        {isComboItem && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[9px] rounded uppercase">
                            COMBO{it.comboName ? `: ${it.comboName}` : ""}
                          </span>
                        )}
                        {variantSize && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[9.5px] rounded">
                            Size: {variantSize}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium space-y-0.5">
                        <p>Quantity: <strong className="text-slate-900">{qty}</strong></p>
                        <p>Price: <strong className="text-slate-900">{formatInvoiceCurrency(unitP)} each</strong></p>
                        <p className="font-bold text-slate-900">Item Total: {formatInvoiceCurrency(totalItemP)}</p>
                      </div>

                      {/* Detailed Customizations & Add-ons breakdown */}
                      {((it.customizationSelections && it.customizationSelections.length > 0) ||
                        (it.customizations && it.customizations.length > 0)) && (
                        <div className="mt-1 bg-amber-50/80 border border-amber-200/60 rounded-lg p-2 text-[10px] text-amber-900 space-y-0.5">
                          <div className="flex justify-between items-center text-[9.5px] font-bold text-amber-900 border-b border-amber-200/50 pb-0.5">
                            <span>Selected Options & Add-ons</span>
                            <span>Base: ₹{baseP}{addonsP > 0 ? ` + Extra: ₹${addonsP}` : ''}</span>
                          </div>

                          {it.customizationSelections && it.customizationSelections.length > 0 ? (
                            it.customizationSelections.map((c: any, cIdx: number) => {
                              const optQty = Number(c.quantity || 1);
                              const uPrice = Number(c.unitPrice || c.extraPrice || c.basePrice || c.additionalPrice || c.price || 0);
                              const subtotal = Number(c.subtotal || uPrice * optQty);

                              return (
                                <div key={cIdx} className="flex justify-between items-center text-[10px]">
                                  <span>
                                    • {c.groupName || "Option"}: <strong>{c.optionName || c.name}</strong>
                                    {optQty > 1 || uPrice > 0 ? (
                                      <span className="ml-1 text-slate-700 font-semibold">
                                        × {optQty} @ {formatInvoiceCurrency(uPrice)}
                                      </span>
                                    ) : ""}
                                  </span>
                                  <span className="font-semibold text-amber-900">
                                    {subtotal > 0 ? `= ${formatInvoiceCurrency(subtotal)}` : "Included"}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            it.customizations.map((cStr: string, cIdx: number) => (
                              <div key={cIdx}>• {cStr}</div>
                            ))
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center font-bold text-slate-800 text-xs">
                      {qty}
                    </td>

                    <td className="px-3 py-3 text-right font-medium text-slate-700 text-xs">
                      {formatInvoiceCurrency(unitP)}
                    </td>

                    <td className="px-3 py-3 text-right pr-4 font-black text-slate-900 text-xs">
                      {formatInvoiceCurrency(totalItemP)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. PRICE BREAKDOWN & PAYMENT SUMMARY ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
        {/* Payment Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Payment Summary
          </h3>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-bold text-slate-900 uppercase">
                {order.paymentGateway ? `${order.paymentGateway} (${order.paymentMethod})` : order.paymentMethod || "COD"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Payment Status:</span>
              <span
                className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus || "PENDING"}
              </span>
            </div>

            {order.transactionId && (
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{order.transactionId}</span>
              </div>
            )}

            {order.paidAt && (
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500">Paid On:</span>
                <span className="font-mono text-slate-700">{formatInvoiceDateTime(order.paidAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transparent Price Breakdown */}
        <div className="space-y-2 text-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Financial Breakdown
          </h3>

          <div className="flex justify-between text-slate-600 font-medium">
            <span>Item Subtotal</span>
            <span className="font-bold text-slate-800">{formatInvoiceCurrency(subtotal)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Coupon Discount {order.appliedCoupon ? `(${order.appliedCoupon})` : ""}</span>
              <span className="font-bold">- {formatInvoiceCurrency(couponDiscount)}</span>
            </div>
          )}

          {rewardDiscount > 0 && (
            <div className="flex justify-between text-amber-800 font-medium">
              <span>Reward Points Discount {rewardPointsUsed > 0 ? `(${rewardPointsUsed} Pts)` : ""}</span>
              <span className="font-bold">- {formatInvoiceCurrency(rewardDiscount)}</span>
            </div>
          )}

          {deliveryFee > 0 && (
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Delivery Charge</span>
              <span className="font-bold text-slate-800">{formatInvoiceCurrency(deliveryFee)}</span>
            </div>
          )}

          {handlingCharge > 0 && (
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Handling Charge</span>
              <span className="font-bold text-slate-800">{formatInvoiceCurrency(handlingCharge)}</span>
            </div>
          )}

          {packagingCharge > 0 && (
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Packaging Charge</span>
              <span className="font-bold text-slate-800">{formatInvoiceCurrency(packagingCharge)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Govt Taxes & GST {taxPct > 0 ? `(${taxPct}%)` : ""}</span>
              <span className="font-bold text-slate-800">{formatInvoiceCurrency(tax)}</span>
            </div>
          )}

          <div className="border-t-2 border-slate-900 pt-2 mt-2 flex justify-between items-center text-sm font-black text-slate-900">
            <span>Grand Total</span>
            <span className="text-emerald-700 text-base font-black">
              {formatInvoiceCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. FOOTER & DISCLAIMER ──────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400 space-y-1">
        <p className="font-bold text-slate-600">Thank you for dining with {restaurantName}!</p>
        <p>This is a computer-generated tax invoice and requires no signature.</p>
      </div>
    </div>
  );
};
