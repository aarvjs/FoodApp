"use client";

import React, { useState } from "react";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAppStore } from "@/lib/store/useAppStore";
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Lock,
  GitBranch,
  Phone,
  Trash2,
  Power,
  ShieldAlert,
} from "lucide-react";

export default function BranchManagersPage() {
  const {
    branchManagerAccounts,
    createBranchManagerAccount,
    deleteBranchManagerAccount,
    toggleBranchManagerStatus,
  } = useAuthStore();
  const { branches } = useAppStore();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "branch-kanpur");

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedBranch = branches.find((b) => b.id === selectedBranchId);
    createBranchManagerAccount({
      name,
      email,
      password,
      restaurantId: "rest-1",
      assignedBranchId: selectedBranchId,
      assignedBranchName: assignedBranch?.name || "Selected Outlet",
      phone: phone || "+91 98765 43210",
      status: "ACTIVE",
    });

    setIsAddModalOpen(false);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
  };

  const filtered = branchManagerAccounts.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.assignedBranchName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-[#FF6B35]" />
            <span>Branch Manager Credentials Management</span>
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Super Admin exclusive portal for creating & provisioning Branch Manager login accounts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Branch Manager</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search manager by name, email, or branch..."
              className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <span className="text-xs font-semibold text-stone-400">
            Total Provisioned: {filtered.length} Managers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Manager Name</th>
                <th className="py-3.5 px-4">Login Email</th>
                <th className="py-3.5 px-4">Assigned Branch Scope</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 font-medium">
              {filtered.map((mgr) => (
                <tr key={mgr.id} className="hover:bg-stone-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mgr.avatar}
                        alt={mgr.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-stone-700"
                      />
                      <div>
                        <span className="font-bold text-white block">{mgr.name}</span>
                        <span className="text-[10px] text-stone-500">ID: {mgr.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-orange-400">
                    {mgr.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{mgr.assignedBranchName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">{mgr.phone}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={mgr.status === "ACTIVE" ? "success" : "danger"}>
                      {mgr.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleBranchManagerStatus(mgr.id)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[11px] font-bold transition-colors"
                      >
                        {mgr.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteBranchManagerAccount(mgr.id)}
                        className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Branch Manager Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Branch Manager Credentials"
        subtitle="Create login email & password for dedicated outlet access"
        maxWidth="md"
      >
        <form onSubmit={handleCreateManager} className="space-y-4 text-stone-900">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Manager Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Kanpur Manager"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Login Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="kanpur.manager@foodhub.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Login Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Assigned Outlet Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94551 12233"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium">
            ⚠️ <strong>Data Isolation Policy</strong>: This manager will only be able to view and manage data belonging to the assigned branch.
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
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
