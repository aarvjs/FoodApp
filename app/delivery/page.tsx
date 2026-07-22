"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { DeliveryBoy, Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Navigation,
  KeyRound,
  Star,
  UserCheck,
  AlertCircle,
} from "lucide-react";

export default function DeliveryPanelPage() {
  const {
    deliveryBoys,
    orders,
    verifyDeliveryOtp,
    selectedBranchId,
  } = useAppStore();

  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const activeDeliveries = orders.filter(
    (o) =>
      o.status === "OUT_FOR_DELIVERY" &&
      (selectedBranchId === "ALL" || o.branchId === selectedBranchId)
  );

  const handleOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalOrder) return;
    const success = verifyDeliveryOtp(otpModalOrder.id, enteredOtp);
    if (success) {
      setOtpModalOrder(null);
      setEnteredOtp("");
      setOtpError("");
    } else {
      setOtpError("Invalid 4-digit PIN. Check customer's OTP.");
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Truck className="w-7 h-7 text-[#FF6B35]" />
            <span>Delivery Fleet & Logistics</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Active order dispatch, driver rosters, distance navigation, & OTP delivery verification
          </p>
        </div>
      </div>

      {/* Active Deliveries Section */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
          <span>Active Orders On Road ({activeDeliveries.length})</span>
        </h2>

        {activeDeliveries.length === 0 ? (
          <div className="glass-card p-8 rounded-3xl bg-white text-center border border-stone-200/80">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800 text-sm">
              All Orders Delivered!
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              No orders are currently out for delivery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDeliveries.map((ord) => (
              <div
                key={ord.id}
                className="glass-card rounded-3xl bg-white border border-orange-200/80 p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#FF6B35] text-white font-extrabold text-xs flex items-center justify-center">
                        {ord.orderNumber.split("-")[1]}
                      </span>
                      <div>
                        <span className="font-bold text-sm text-stone-900 block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700">
                          {ord.branchName} Outlet
                        </span>
                      </div>
                    </div>
                    <Badge variant="primary">ON THE WAY</Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-stone-600 font-medium">
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                      <p className="font-bold text-stone-900">{ord.customerName}</p>
                      <div className="flex items-center gap-1 text-stone-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{ord.customerPhone}</span>
                      </div>
                      <div className="flex items-start gap-1 text-stone-500 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ord.customerAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 pt-1">
                      <span>Assigned Rider:</span>
                      <span className="text-[#FF6B35]">
                        {ord.deliveryBoyName || "Agent assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        ord.customerAddress || ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-orange-500" />
                      <span>GPS Map</span>
                    </a>

                    <button
                      onClick={() => {
                        setOtpModalOrder(ord);
                        setEnteredOtp("");
                        setOtpError("");
                      }}
                      className="py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1 hover:opacity-95 transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Enter OTP</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Agents Roster */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-extrabold text-stone-900">
          Delivery Fleet Roster
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deliveryBoys.map((agent) => (
            <div
              key={agent.id}
              className="glass-card rounded-2xl bg-white border border-stone-200/80 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-orange-200"
                />
                <div>
                  <h4 className="font-extrabold text-stone-900 text-xs">
                    {agent.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-medium">
                    {agent.branchName} • {agent.totalDeliveries} orders done
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                    <span>{agent.rating} Rating</span>
                  </div>
                </div>
              </div>

              <Badge
                variant={
                  agent.status === "AVAILABLE"
                    ? "success"
                    : agent.status === "ON_DELIVERY"
                    ? "primary"
                    : "neutral"
                }
              >
                {agent.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* OTP Delivery Verification Modal */}
      {otpModalOrder && (
        <Modal
          isOpen={!!otpModalOrder}
          onClose={() => setOtpModalOrder(null)}
          title={`Delivery OTP Verification: ${otpModalOrder.orderNumber}`}
          subtitle={`Customer: ${otpModalOrder.customerName} (${otpModalOrder.customerPhone})`}
          maxWidth="sm"
        >
          <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl text-center">
              <span className="text-xs font-semibold text-stone-600 block">
                Ask customer for 4-digit Delivery PIN
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                (Demo Hint: Correct OTP is{" "}
                <strong className="text-[#FF6B35] font-extrabold">
                  {otpModalOrder.otp}
                </strong>
                )
              </span>
            </div>

            <div>
              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full text-center tracking-widest text-2xl font-extrabold py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-[#FF6B35] focus:bg-white"
                required
              />
            </div>

            {otpError && (
              <p className="text-xs text-rose-600 font-bold text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{otpError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/20"
            >
              Verify & Complete Delivery
            </button>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
