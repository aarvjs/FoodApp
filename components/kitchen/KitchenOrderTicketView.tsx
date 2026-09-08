"use client";

import React from "react";
import { formatInvoiceDate, formatInvoiceTime } from "@/lib/utils/invoiceUtils";

interface KitchenOrderTicketViewProps {
  order: any;
  branch?: any;
}

export const KitchenOrderTicketView: React.FC<KitchenOrderTicketViewProps> = ({
  order,
  branch,
}) => {
  if (!order) return null;

  const orderNum = order.orderNumber || order.id;
  const orderDate = formatInvoiceDate(order.createdAt);
  const orderTime = formatInvoiceTime(order.createdAt);

  const branchName = order.branchName || branch?.name || "Main Branch";
  const customerName = order.customerName || "Walk-in Customer";
  const customerPhone = order.customerPhone || "";
  const isTakeAway =
    (order.orderType || "").toUpperCase() === "TAKE_AWAY" ||
    (order.orderType || "").toUpperCase() === "TAKEAWAY";

  const instructions =
    order.instructions ||
    order.deliveryInstructions ||
    order.customInstructions ||
    "";

  return (
    <div
      id={`kot-print-area-${order.id}`}
      className="bg-white text-slate-900 font-mono p-6 sm:p-8 max-w-xl mx-auto border-2 border-slate-900 rounded-2xl shadow-sm space-y-5 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full"
    >
      {/* KOT HEADER */}
      <div className="border-b-2 border-dashed border-slate-900 pb-4 text-center space-y-1">
        <h1 className="text-2xl font-black tracking-wider uppercase text-slate-900">
          *** KITCHEN ORDER TICKET ***
        </h1>
        <p className="text-xs font-bold uppercase text-slate-700">
          KOT # {orderNum}
        </p>
        <p className="text-sm font-black text-slate-900 uppercase pt-1">
          Branch: {branchName}
        </p>
      </div>

      {/* TICKET METADATA */}
      <div className="border-b-2 border-dashed border-slate-900 pb-4 text-xs space-y-1.5">
        <div className="flex justify-between items-center font-bold">
          <span>Date/Time:</span>
          <span>
            {orderDate} @ {orderTime}
          </span>
        </div>
        <div className="flex justify-between items-center font-bold">
          <span>Customer:</span>
          <span className="uppercase">{customerName}</span>
        </div>
        <div className="pt-1 flex justify-between items-center">
          <span className="font-bold">ORDER TYPE:</span>
          <span
            className={`px-2.5 py-1 text-xs font-black rounded uppercase border-2 ${
              isTakeAway
                ? "bg-purple-100 text-purple-950 border-purple-950"
                : "bg-blue-100 text-blue-950 border-blue-950"
            }`}
          >
            {isTakeAway ? "🛍️ TAKE AWAY / SELF PICKUP" : "🛵 DELIVERY ORDER"}
          </span>
        </div>
      </div>

      {/* ITEMS BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-900 pb-1 text-xs font-black uppercase">
          <span>ITEM & PREPARATION DETAILS</span>
          <span>QTY</span>
        </div>

        <div className="space-y-4 divide-y-2 divide-slate-200">
          {order.items?.map((it: any, idx: number) => {
            const isCombo =
              it.isCombo || it.itemType === "combo" || Boolean(it.comboName);
            const itemName =
              it.productName || it.name || it.comboName || "Ordered Item";
            const qty = it.quantity || 1;

            const variantStr =
              typeof it.selectedVariant === "string"
                ? it.selectedVariant
                : it.selectedVariant?.name ||
                  it.selectedSize ||
                  it.size ||
                  null;

            const customizations = it.customizationSelections || [];
            const customStrings = it.customizations || [];
            const comboOptions = it.selectedComboOptions || [];
            const removedItems = it.removedItems || [];
            const replacements = it.replacements || [];
            const addons = it.selectedAddons || [];
            const itemNotes = it.customInstructions || "";

            return (
              <div key={idx} className={idx > 0 ? "pt-3" : ""}>
                <div className="flex justify-between items-start font-black text-sm text-slate-900">
                  <div className="space-y-0.5 max-w-[82%]">
                    <span className="uppercase text-base">{itemName}</span>
                    {isCombo && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-200 text-amber-950 text-[10px] font-black uppercase rounded">
                        COMBO
                      </span>
                    )}
                  </div>
                  <span className="text-base font-black px-2 py-0.5 bg-slate-900 text-white rounded">
                    x {qty}
                  </span>
                </div>

                {/* Size / Variant */}
                {variantStr && (
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    • Size/Variant: <span className="underline">{variantStr}</span>
                  </p>
                )}

                {/* Combo Selections Breakdown */}
                {comboOptions.length > 0 && (
                  <div className="mt-1.5 ml-2 p-2 bg-amber-50/90 border-l-4 border-amber-500 rounded text-xs space-y-1 text-slate-900">
                    <p className="font-black uppercase text-[10.5px] text-amber-900">
                      Combo Selections:
                    </p>
                    {comboOptions.map((opt: any, oIdx: number) => (
                      <p key={oIdx} className="font-bold">
                        - {opt.categoryName || opt.groupName || "Option"}:{" "}
                        <span className="text-amber-950 font-black">
                          {opt.optionName || opt.name}
                        </span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Customizations / Options */}
                {customizations.length > 0 && (
                  <div className="mt-1.5 ml-2 p-2 bg-slate-100 border-l-4 border-slate-700 rounded text-xs space-y-0.5 text-slate-900">
                    <p className="font-black uppercase text-[10.5px] text-slate-800">
                      Customizations:
                    </p>
                    {customizations.map((c: any, cIdx: number) => {
                      const optQty = Number(c.quantity || 1);
                      return (
                        <p key={cIdx} className="font-bold">
                          - {c.groupName || "Option"}:{" "}
                          <span className="font-black">{c.optionName || c.name}</span>
                          <span className="ml-1 text-slate-900 font-black">× {optQty}</span>
                        </p>
                      );
                    })}
                  </div>
                )}

                {/* Raw Customizations List */}
                {customizations.length === 0 && customStrings.length > 0 && (
                  <div className="mt-1 ml-2 text-xs font-semibold text-slate-800 space-y-0.5">
                    {customStrings.map((cStr: string, cIdx: number) => (
                      <p key={cIdx}>• {cStr}</p>
                    ))}
                  </div>
                )}

                {/* Add-ons */}
                {addons.length > 0 && (
                  <p className="text-xs font-bold text-blue-900 mt-1 ml-2">
                    + Add-ons: {addons.join(", ")}
                  </p>
                )}

                {/* Removed items */}
                {removedItems.length > 0 && (
                  <p className="text-xs font-bold text-rose-700 mt-1 ml-2">
                    🚫 REMOVE: {removedItems.join(", ")}
                  </p>
                )}

                {/* Replacements */}
                {replacements.length > 0 && (
                  <p className="text-xs font-bold text-amber-800 mt-1 ml-2">
                    🔄 REPLACEMENTS: {replacements.join(", ")}
                  </p>
                )}

                {/* Item-level Instructions */}
                {itemNotes && (
                  <p className="text-xs font-bold text-orange-950 bg-orange-100 p-1.5 rounded mt-1.5 italic">
                    Note: "{itemNotes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SPECIAL INSTRUCTIONS */}
      {instructions && (
        <div className="border-2 border-slate-900 rounded-xl p-3 bg-amber-50 text-xs space-y-1">
          <p className="font-black uppercase text-amber-950 tracking-wider">
            ⚠️ KITCHEN INSTRUCTIONS:
          </p>
          <p className="font-extrabold text-slate-900 text-xs leading-relaxed italic">
            "{instructions}"
          </p>
        </div>
      )}

      {/* FOOTER */}
      <div className="border-t-2 border-dashed border-slate-900 pt-3 text-center text-[11px] font-bold text-slate-700 uppercase space-y-0.5">
        <p>*** END OF KITCHEN TICKET ***</p>
        <p>Total Items: {order.items?.length || 0}</p>
      </div>
    </div>
  );
};
