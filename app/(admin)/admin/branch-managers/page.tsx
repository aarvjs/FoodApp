"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Plus, ShieldCheck, Mail, Phone, Key, Lock, GitFork, UserX, CheckCircle, X, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { authService } from "@/services/authService";
import { BranchManagerUser } from "@/types";

export default function SuperAdminBranchManagersPage() {
  const branches = useStore((state) => state.branches);
  const restaurants = useStore((state) => state.restaurants);

  const [managers, setManagers] = useState<BranchManagerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    restaurantId: "",
    branchId: ""
  });

  const [toastMsg, setToastMsg] = useState("");

  const loadManagers = async () => {
    setLoading(true);
    try {
      const list = await authService.getManagers();
      setManagers(list);
    } catch (e) {
      console.error("Failed to load managers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedBranch = branches.find((b) => b.id === formData.branchId) || branches[0];
      const selectedRestId = formData.restaurantId || selectedBranch?.restaurantId || restaurants[0]?.id || "";

      await authService.createManager({
        name: formData.name,
        email: formData.email,
        pass: formData.password,
        phone: formData.phone,
        restaurantId: selectedRestId,
        assignedBranchId: selectedBranch?.id || "",
        assignedBranchName: selectedBranch?.name || selectedBranch?.branchName || "Branch"
      });

      setToastMsg(`Manager ${formData.name} created successfully!`);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", phone: "", restaurantId: "", branchId: "" });
      await loadManagers();
    } catch (err: any) {
      alert("Failed to create manager: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (managerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await authService.toggleManagerStatus(managerId, newStatus);
      setManagers(managers.map((m) => (m.id === managerId ? { ...m, status: newStatus } : m)));
      setToastMsg(`Manager status updated to ${newStatus}`);
    } catch (e: any) {
      alert("Error toggling manager status: " + e.message);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      setToastMsg(`Password reset email sent to ${email}`);
    } catch (e: any) {
      alert("Failed to send password reset email: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" /> Branch Managers Directory
          </h1>
          <p className="text-xs text-slate-500">Super Admin control over Branch Manager credentials, branch assignments, and access status</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Manager
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-emerald-600 font-bold">Dismiss</button>
        </div>
      )}

      {/* Managers Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading Managers from Firestore...
        </div>
      ) : managers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <UserX className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Branch Managers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Create branch managers to assign them to specific branches.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Create First Manager
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managers.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                    {m.name?.[0] || "M"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{m.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${m.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {m.status || "ACTIVE"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Assigned Branch</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <GitFork className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {m.assignedBranchName || "Branch"}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Phone Number</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{m.phone || "N/A"}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleResetPassword(m.email)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Reset Password
                </button>

                <button
                  onClick={() => handleToggleStatus(m.id, m.status || "ACTIVE")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors shrink-0 ${
                    m.status === "ACTIVE"
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {m.status === "ACTIVE" ? "Disable Manager" : "Enable Manager"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Manager */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl custom-scrollbar max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" /> Create Branch Manager
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManager} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manager Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manager Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="ramesh@branch.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Branch *</label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.branchName} ({b.location?.city || "Branch"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
