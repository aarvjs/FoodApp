"use client";

import React, { useState } from "react";
import { Users, Award, Wallet, Star, ShoppingBag } from "lucide-react";
import { OrderModel } from "@/models/order";

interface CustomersModuleProps {
  orders: OrderModel[];
}

export function CustomersModule({ orders }: CustomersModuleProps) {
  // Aggregate customers from orders
  const customerMap: Record<string, { name: string; phone: string; count: number; totalSpent: number }> = {};

  orders.forEach((o) => {
    const key = o.customerPhone || o.customerName || "Guest Customer";
    if (!customerMap[key]) {
      customerMap[key] = {
        name: o.customerName || "Customer",
        phone: o.customerPhone || "+91 98765 43210",
        count: 0,
        totalSpent: 0
      };
    }
    customerMap[key].count += 1;
    customerMap[key].totalSpent += o.totalAmount || 0;
  });

  const customersList = Object.values(customerMap);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" /> Restaurant Customer Base ({customersList.length})
        </h2>
        <p className="text-xs text-slate-500">Track loyal customers, order history & reward points</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders Placed</th>
              <th className="px-4 py-3">Total Spend</th>
              <th className="px-4 py-3">Loyalty Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customersList.map((cust, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{cust.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono">{cust.phone}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{cust.count} Orders</td>
                <td className="px-4 py-3 font-black text-emerald-600">₹{cust.totalSpent.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full text-[10px] uppercase">
                    GOLD MEMBER
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
