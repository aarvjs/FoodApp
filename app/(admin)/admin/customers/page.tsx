"use client";

import React from "react";
import { Users, Phone, Mail, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function SuperAdminCustomersPage() {
  const customers = useStore((state) => state.customers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" /> Customer Directory
        </h1>
        <p className="text-xs text-slate-500">Super Admin overview of customer accounts & spending history</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-x-auto custom-scrollbar shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Email & Phone</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                <td className="px-4 py-3">
                  <div className="text-slate-800">{c.email}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{c.phone}</div>
                </td>
                <td className="px-4 py-3 font-bold">{c.totalOrders}</td>
                <td className="px-4 py-3 font-black text-emerald-600">₹{c.totalSpent}</td>
                <td className="px-4 py-3 text-slate-500">{c.lastOrderDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
