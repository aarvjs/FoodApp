"use client";

import React, { useState } from "react";
import { Plus, GitFork, Trash2, Key, Copy, Check, ShieldCheck, MapPin, X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { AddressSearch } from "@/components/location/AddressSearch";
import { AddressLocation, Branch } from "@/types";
import { authService } from "@/services/authService";

export default function SuperAdminBranchesPage() {
  const branches = useStore((state) => state.branches);
  const restaurants = useStore((state) => state.restaurants);
  const addBranch = useStore((state) => state.addBranch);
  const deleteBranch = useStore((state) => state.deleteBranch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    restaurantId: restaurants[0]?.id || "",
    name: "",
    phone: "",
    email: "",
    managerName: "",
    managerEmail: "",
    generatedPassword: "",
    deliveryRadiusKm: 5,
    openingTime: "10:00 AM",
    closingTime: "11:00 PM",
    status: "OPEN" as "OPEN" | "CLOSED" | "BUSY",
    location: null as AddressLocation | null
  });

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, generatedPassword: pwd }));
  };

  const handleCopyPassword = (pwd: string, id: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location) {
      alert("Please select a valid location via Address Search.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedRest = restaurants.find((r) => r.id === formData.restaurantId);
      const selectedRestId = formData.restaurantId || restaurants[0]?.id || "";
      const password = formData.generatedPassword || "BranchPass#2026";

      // 1. Create Branch in Firestore
      const newBranch = await addBranch({
        restaurantId: selectedRestId,
        restaurantName: selectedRest?.name || "Restaurant",
        name: formData.name,
        branchName: formData.name,
        phone: formData.phone,
        email: formData.email,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        generatedPassword: password,
        deliveryRadiusKm: Number(formData.deliveryRadiusKm),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        status: formData.status,
        location: formData.location
      });

      // 2. Create Branch Manager User in Firebase Auth & Firestore
      if (formData.managerEmail && password) {
        try {
          await authService.createManager({
            name: formData.managerName || "Branch Manager",
            email: formData.managerEmail,
            pass: password,
            phone: formData.phone,
            restaurantId: selectedRestId,
            assignedBranchId: newBranch.id,
            assignedBranchName: formData.name
          });
        } catch (authErr: any) {
          console.warn("Manager Auth creation warning:", authErr.message);
        }
      }

      setIsModalOpen(false);
      setFormData({
        restaurantId: restaurants[0]?.id || "",
        name: "",
        phone: "",
        email: "",
        managerName: "",
        managerEmail: "",
        generatedPassword: "",
        deliveryRadiusKm: 5,
        openingTime: "10:00 AM",
        closingTime: "11:00 PM",
        status: "OPEN",
        location: null
      });
    } catch (err: any) {
      alert("Failed to create branch: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitFork className="w-6 h-6 text-emerald-600" /> Manage Branches & Locations
          </h1>
          <p className="text-xs text-slate-500">Create new branches, configure address coordinates & generate manager logins in Firestore</p>
        </div>
        <button
          onClick={() => {
            handleGeneratePassword();
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {/* Branch Cards */}
      {branches.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
          <GitFork className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Branches Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Add Branch" to create a branch under a restaurant and automatically create manager credentials.
          </p>
          <button
            onClick={() => {
              handleGeneratePassword();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Add First Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {branches.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    {b.restaurantName || "Restaurant"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{b.name || b.branchName}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${b.status === "OPEN" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {b.status}
                </span>
              </div>

              {/* Address Location Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-start gap-2 font-medium text-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b.location?.formattedAddress || b.address || "Location Address"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600 font-mono">
                  <div>City: <strong className="text-slate-900 font-sans">{b.location?.city || "N/A"}</strong></div>
                  <div>State: <strong className="text-slate-900 font-sans">{b.location?.state || "N/A"}</strong></div>
                  <div>Pincode: <strong className="text-slate-900 font-sans">{b.location?.pincode || "N/A"}</strong></div>
                </div>
              </div>

              {/* Branch Manager Credentials */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Branch Manager Account
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-200/60 text-amber-900 rounded font-mono">
                    role: branchManager
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Manager Name</span>
                    <span className="font-semibold text-slate-900">{b.managerName || "Unassigned"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Email Login</span>
                    <span className="font-mono text-slate-900 truncate block">{b.managerEmail || "N/A"}</span>
                  </div>
                </div>

                {b.generatedPassword && (
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-600" /> Password:
                      <strong className="font-mono text-slate-900">{b.generatedPassword}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyPassword(b.generatedPassword!, b.id)}
                      className="px-2 py-1 bg-amber-200/70 hover:bg-amber-300 text-amber-900 rounded font-bold text-[10px] flex items-center gap-1 transition-colors"
                    >
                      {copiedId === b.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedId === b.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Radius: <strong className="text-slate-800">{b.deliveryRadiusKm || b.deliveryRadius || 5} KM</strong></span>
                <button
                  onClick={() => deleteBranch(b.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Branch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitFork className="w-5 h-5 text-emerald-600" /> Add New Branch & Location
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Parent Restaurant *</label>
                <select
                  required
                  value={formData.restaurantId}
                  onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. Bandra West Branch"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="+91 91234 56789"
                  />
                </div>
              </div>

              {/* Address Search */}
              <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/60">
                <AddressSearch
                  required
                  value={formData.location || undefined}
                  onChange={(loc) => setFormData({ ...formData, location: loc })}
                  placeholder="Search address or location..."
                />
              </div>

              {/* Branch Manager Setup */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Branch Manager Authentication User Setup
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Manager Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Manager Email Login *</label>
                    <input
                      type="email"
                      required
                      value={formData.managerEmail}
                      onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      placeholder="rahul.manager@spicykingdom.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Auto Generated Secure Password</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.generatedPassword}
                      onChange={(e) => setFormData({ ...formData, generatedPassword: e.target.value })}
                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Radius (KM)</label>
                  <input
                    type="number"
                    value={formData.deliveryRadiusKm}
                    onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Branch & User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
