"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { useAppStore } from "@/lib/store/useAppStore";
import { Order, OrderStatus } from "@/types";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Flame,
} from "lucide-react";

export default function KitchenPanelPage() {
  const { orders, updateOrderStatus, selectedBranchId } = useAppStore();

  // Filter orders for selected branch
  const kitchenOrders = orders.filter(
    (o) =>
      (selectedBranchId === "ALL" || o.branchId === selectedBranchId) &&
      o.status !== "CANCELLED"
  );

  const incomingOrders = kitchenOrders.filter((o) => o.status === "PENDING");
  const preparingOrders = kitchenOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = kitchenOrders.filter((o) => o.status === "READY");
  const completedOrders = kitchenOrders.filter((o) => o.status === "DELIVERED" || o.status === "OUT_FOR_DELIVERY");

  // Timer simulation tick
  const [timerSeconds, setTimerSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderKanbanCard = (ord: Order, currentStage: string) => {
    // Simulated timer calculation
    const elapsedMinutes = 12 + (timerSeconds % 5);

    return (
      <div
        key={ord.id}
        className="glass-card rounded-2xl bg-white border border-orange-200/80 p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FF6B35] text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-orange-500/20">
              {ord.orderNumber.split("-")[1]}
            </span>
            <div>
              <span className="font-extrabold text-sm text-stone-900 block leading-tight">
                {ord.orderNumber}
              </span>
              <span className="text-[10px] font-bold text-amber-700 uppercase">
                {ord.branchName} Branch • {ord.orderType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#FF6B35] bg-orange-50 px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsedMinutes}m / {ord.estimatedPrepTimeMinutes}m</span>
          </div>
        </div>

        {/* Itemized Kitchen Ticket Checklist */}
        <div className="space-y-1.5 py-2 border-y border-stone-100 max-h-36 overflow-y-auto">
          {ord.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs font-semibold text-stone-800 bg-stone-50/70 p-2 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-900 text-xs font-extrabold flex items-center justify-center">
                  {item.quantity}x
                </span>
                <span>{item.productName}</span>
              </div>
              {item.customizations && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {item.customizations.join(", ")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {currentStage === "INCOMING" && (
            <button
              onClick={() => updateOrderStatus(ord.id, "PREPARING")}
              className="w-full py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 hover:opacity-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>Start Cooking</span>
            </button>
          )}

          {currentStage === "PREPARING" && (
            <button
              onClick={() => updateOrderStatus(ord.id, "READY")}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Ready for Pickup</span>
            </button>
          )}

          {currentStage === "READY" && (
            <div className="w-full text-center py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200">
              ✓ Waiting Counter Pickup
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-[#FF6B35]" />
            <span>Kitchen Display System (KDS)</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Real-time Kanban view for chef staff & line order preparation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-3 py-1 text-xs">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Active Station Live</span>
          </Badge>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Incoming Orders */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-orange-200/60 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-orange-200/80">
            <span className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Incoming Orders</span>
            </span>
            <Badge variant="info">{incomingOrders.length}</Badge>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {incomingOrders.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8 italic">
                No new incoming tickets
              </p>
            ) : (
              incomingOrders.map((ord) => renderKanbanCard(ord, "INCOMING"))
            )}
          </div>
        </div>

        {/* Column 2: Preparing (In Cooking) */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-orange-200/60 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-orange-200/80">
            <span className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span>Preparing Now</span>
            </span>
            <Badge variant="warning">{preparingOrders.length}</Badge>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8 italic">
                No active orders cooking
              </p>
            ) : (
              preparingOrders.map((ord) => renderKanbanCard(ord, "PREPARING"))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-orange-200/60 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-orange-200/80">
            <span className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Ready for Counter</span>
            </span>
            <Badge variant="success">{readyOrders.length}</Badge>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8 italic">
                No completed dishes awaiting dispatch
              </p>
            ) : (
              readyOrders.map((ord) => renderKanbanCard(ord, "READY"))
            )}
          </div>
        </div>

        {/* Column 4: Completed / Dispatched */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-orange-200/60 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-orange-200/80">
            <span className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-stone-400" />
              <span>Dispatched</span>
            </span>
            <Badge variant="neutral">{completedOrders.length}</Badge>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1 opacity-80">
            {completedOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3 bg-white rounded-xl border border-stone-200/60 text-xs"
              >
                <div className="flex justify-between font-bold text-stone-900 mb-1">
                  <span>{ord.orderNumber}</span>
                  <span className="text-emerald-600">Dispatched</span>
                </div>
                <p className="text-stone-500">{ord.customerName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
