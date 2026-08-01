"use client";

import React from "react";
import { Users } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerCustomersPage() {
  const user = useStore((state) => state.user);
  const customers = useStore((state) => state.customers);
  const branchCustomers = customers.filter((c) => !c.branchId || c.branchId === user?.branchId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-600" /> Branch Customers
        </h1>
        <p className="text-xs text-slate-500">Customers who ordered from your branch location</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-x-auto custom-scrollbar shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap min-w-[500px]">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {branchCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                <td className="px-4 py-3">{c.phone} • {c.email}</td>
                <td className="px-4 py-3 font-bold">{c.totalOrders}</td>
                <td className="px-4 py-3 font-black text-amber-600">₹{c.totalSpent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
