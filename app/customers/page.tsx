"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { formatCurrency } from "@/lib/utils";
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, Award } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  tier: "VIP GOLD" | "REGULAR" | "NEW";
  addresses: string[];
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "Aarav Sharma",
    phone: "+91 98765 11223",
    email: "aarav.sharma@gmail.com",
    totalOrders: 34,
    totalSpent: 28450,
    tier: "VIP GOLD",
    addresses: [
      "Flat 402, Royal Heights, Swaroop Nagar, Kanpur",
      "Office 12, Cyber City, Kanpur",
    ],
  },
  {
    id: "cust-2",
    name: "Sneha Patel",
    phone: "+91 99188 77665",
    email: "sneha.p@outlook.com",
    totalOrders: 18,
    totalSpent: 14200,
    tier: "VIP GOLD",
    addresses: ["House 14B, Civil Lines, Kanpur"],
  },
  {
    id: "cust-3",
    name: "Mohit Verma",
    phone: "+91 91234 56789",
    email: "mohit.v@yahoo.com",
    totalOrders: 9,
    totalSpent: 6800,
    tier: "REGULAR",
    addresses: ["Hazratganj Main Market, Lucknow"],
  },
  {
    id: "cust-4",
    name: "Ananya Roy",
    phone: "+91 98111 22334",
    email: "ananya.roy@gmail.com",
    totalOrders: 4,
    totalSpent: 3120,
    tier: "NEW",
    addresses: ["Tower C, Sector 62, Noida, Delhi NCR"],
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<CustomerRecord | null>(null);

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Customer Directory & Spending
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            View repeat diner profiles, delivery addresses, and total spending metrics
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-3xl bg-white border border-orange-100/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FFFDF8] border-b border-stone-100 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Tier Badge</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spending</th>
                <th className="py-3.5 px-4 text-right">Saved Addresses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filtered.map((cust) => (
                <tr
                  key={cust.id}
                  className="hover:bg-orange-50/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {cust.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-stone-800">{cust.phone}</div>
                    <div className="text-[11px] text-stone-400">{cust.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        cust.tier === "VIP GOLD"
                          ? "primary"
                          : cust.tier === "REGULAR"
                          ? "info"
                          : "neutral"
                      }
                    >
                      {cust.tier}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-800">
                    {cust.totalOrders} orders
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#FF6B35]">
                    {formatCurrency(cust.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCust(cust)}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6B35] font-bold rounded-xl text-xs ml-auto transition-colors"
                    >
                      View ({cust.addresses.length}) Addresses
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Address Drawer Modal */}
      {selectedCust && (
        <Modal
          isOpen={!!selectedCust}
          onClose={() => setSelectedCust(null)}
          title={`Saved Addresses: ${selectedCust.name}`}
          subtitle={`Total Lifetime Spending: ${formatCurrency(selectedCust.totalSpent)}`}
          maxWidth="md"
        >
          <div className="space-y-3">
            {selectedCust.addresses.map((addr, i) => (
              <div
                key={i}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-800 font-medium leading-relaxed">
                  {addr}
                </p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
