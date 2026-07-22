"use client";

import React, { useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAppStore } from "@/lib/store/useAppStore";
import { Building2, Plus, Search, Mail, Phone, Store } from "lucide-react";

export default function AdminOwnersPage() {
  const { ownerAccounts, createOwnerAccount } = useAuthStore();
  const { restaurants } = useAppStore();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRestId, setSelectedRestId] = useState(restaurants[0]?.id || "rest-1");

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const rest = restaurants.find((r) => r.id === selectedRestId);
    createOwnerAccount({
      name,
      email,
      restaurantId: selectedRestId,
      restaurantName: rest?.name || "Food Kingdom",
    });
    setIsAddModalOpen(false);
    setName("");
    setEmail("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#FF6B35]" />
            <span>Restaurant Owner Accounts</span>
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Super Admin portal to manage brand owners and executive credentials
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Owner Account</span>
        </button>
      </div>

      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search owner by name, email, or restaurant..."
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Login Email</th>
                <th className="py-3.5 px-4">Associated Restaurant</th>
                <th className="py-3.5 px-4 text-right">Role Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 font-medium">
              {ownerAccounts.map((own) => (
                <tr key={own.id} className="hover:bg-stone-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={own.avatar}
                        alt={own.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-stone-700"
                      />
                      <span className="font-bold text-white">{own.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-orange-400">{own.email}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {own.restaurantName}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant="primary">OWNER</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Restaurant Owner Account"
        subtitle="Provision portal login access for a brand owner"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOwner} className="space-y-4 text-stone-900">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Owner Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Owner Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="owner@brand.com"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Assign Restaurant Portfolio
            </label>
            <select
              value={selectedRestId}
              onChange={(e) => setSelectedRestId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Create Owner Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
