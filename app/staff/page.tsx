"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useAppStore } from "@/lib/store/useAppStore";
import { Staff, UserRole } from "@/types";
import { UserCheck, Plus, Search, Phone, Mail, Shield, Building2 } from "lucide-react";

export default function StaffPage() {
  const { staff, branches, addStaff } = useAppStore();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Staff & Role Permissions Matrix
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage branch managers, kitchen chefs, cashiers, and delivery agents
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table Container */}
      <div className="glass-card rounded-3xl bg-white border border-orange-100/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name, phone, or role..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FFFDF8] border-b border-stone-100 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Assigned Branch</th>
                <th className="py-3.5 px-4">Role Badge</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredStaff.map((st) => (
                <tr key={st.id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{st.name}</div>
                    <div className="text-[11px] text-stone-400">{st.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-700">
                    {st.branchName}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="primary">{st.role.replace("_", " ")}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 font-medium">
                    {st.phone}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">{st.joinedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant={st.status === "ACTIVE" ? "success" : "neutral"}>
                      {st.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        subtitle="Assign role permissions and branch location"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Role
              </label>
              <select className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800">
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="KITCHEN_STAFF">Kitchen Chef</option>
                <option value="DELIVERY_BOY">Delivery Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Branch Outlet
              </label>
              <select className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800">
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="staff@foodkingdom.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
            >
              Save Staff Member
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
