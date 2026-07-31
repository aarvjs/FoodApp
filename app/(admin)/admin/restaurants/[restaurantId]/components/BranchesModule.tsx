"use client";

import React, { useState } from "react";
import { GitBranch, Plus, Edit3, Trash2, Key, Loader2, Upload, MapPin, Store, CheckCircle2 } from "lucide-react";
import { BranchModel } from "@/models/branch";
import { branchRepository } from "@/repositories/branchRepository";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { storageService } from "@/services/storageService";

interface BranchesModuleProps {
  restaurantId: string;
  restaurantName: string;
  branches: BranchModel[];
  onRefresh: () => void;
}

export function BranchesModule({ restaurantId, restaurantName, branches, onRefresh }: BranchesModuleProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchModel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirm delete modal
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);

  const [branchImageFile, setBranchImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    formattedAddress: "",
    latitude: 26.8467,
    longitude: 80.9462,
    deliveryRadiusKm: 5,
    openingTime: "09:00 AM",
    closingTime: "11:00 PM",
    status: "OPEN" as "OPEN" | "CLOSED" | "BUSY",
    managerName: "",
    managerEmail: "",
    password: ""
  });

  const handleOpenDrawer = (branch?: BranchModel) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name || "",
        phone: branch.phone || "",
        email: branch.email || "",
        formattedAddress: branch.location?.formattedAddress || "",
        latitude: branch.location?.latitude || 26.8467,
        longitude: branch.location?.longitude || 80.9462,
        deliveryRadiusKm: branch.deliveryRadiusKm || 5,
        openingTime: branch.openingTime || "09:00 AM",
        closingTime: branch.closingTime || "11:00 PM",
        status: branch.status || "OPEN",
        managerName: branch.managerName || "",
        managerEmail: branch.managerEmail || "",
        password: ""
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: "",
        phone: "+91 98765 43210",
        email: "branch@spicykingdom.com",
        formattedAddress: "Swaroop Nagar, Kanpur",
        latitude: 26.8467,
        longitude: 80.9462,
        deliveryRadiusKm: 5,
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
        status: "OPEN",
        managerName: "Rahul Manager",
        managerEmail: `manager${Date.now().toString().slice(-4)}@spicykingdom.com`,
        password: "ManagerPass#123"
      });
    }
    setBranchImageFile(null);
    setIsDrawerOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: Partial<BranchModel> = {
        restaurantId,
        restaurantName,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        deliveryRadiusKm: Number(formData.deliveryRadiusKm),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        status: formData.status,
        location: {
          formattedAddress: formData.formattedAddress,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          city: "Kanpur",
          state: "Uttar Pradesh",
          pincode: "208002"
        }
      };

      if (editingBranch) {
        await branchRepository.update(editingBranch.id, payload);
        setToastMessage("Branch details updated!");
      } else {
        await branchRepository.create(payload);
        setToastMessage("New branch added successfully!");
      }

      setIsDrawerOpen(false);
      onRefresh();
    } catch (err: any) {
      alert("Failed to save branch: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBranchId) return;
    setSubmitting(true);
    try {
      await branchRepository.delete(deletingBranchId);
      setToastMessage("Branch deleted.");
      setDeletingBranchId(null);
      onRefresh();
    } catch (err: any) {
      alert("Failed to delete branch: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}

      {/* Top Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-600" /> Restaurant Branch Network
          </h2>
          <p className="text-xs text-slate-500">Every branch owns its menus, categories, tables, and orders</p>
        </div>

        <button
          onClick={() => handleOpenDrawer()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{branch.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                branch.status === "OPEN" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {branch.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {branch.location?.formattedAddress}</p>
              <p>Delivery Radius: <strong className="text-slate-900">{branch.deliveryRadiusKm} KM</strong></p>
              <p>Manager: <strong className="text-slate-900">{branch.managerName}</strong> ({branch.managerEmail})</p>
              <p>Hours: <strong className="text-slate-900">{branch.openingTime} - {branch.closingTime}</strong></p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => handleOpenDrawer(branch)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Edit Branch
              </button>
              <button
                onClick={() => setDeletingBranchId(branch.id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Right Slide Drawer for Add/Edit Branch */}
      <SlideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingBranch ? "Edit Branch Details" : "Add New Restaurant Branch"}
        subtitle="Configure branch address, geo-coordinates, hours & assigned branch manager"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="e.g. Civil Lines Branch"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Branch Address *</label>
            <textarea
              rows={2}
              required
              value={formData.formattedAddress}
              onChange={(e) => setFormData({ ...formData, formattedAddress: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Full street address..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Radius (KM)</label>
              <input
                type="number"
                value={formData.deliveryRadiusKm}
                onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          {/* Branch Manager Assignment */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
            <h4 className="font-bold text-emerald-950 text-xs">Assigned Branch Manager Credentials</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">Manager Name</label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">Manager Email</label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-emerald-900">Generated Password</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Key className="w-3 h-3" /> Generate Password
                </button>
              </div>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-900"
                placeholder="Manager login password..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingBranch ? "Update Branch" : "Create Branch"}
            </button>
          </div>
        </form>
      </SlideDrawer>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBranchId}
        onClose={() => setDeletingBranchId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Restaurant Branch"
        message="Are you sure you want to delete this branch? All associated floor tables and menu snapshots will be unlinked."
        loading={submitting}
      />
    </div>
  );
}
