"use client";

import React, { useState, useEffect, useRef } from "react";
import { GitBranch, Plus, Edit3, Trash2, Key, Loader2, Upload, MapPin, Store, CheckCircle2, Search, Navigation } from "lucide-react";
import { BranchModel } from "@/models/branch";
import { branchRepository } from "@/repositories/branchRepository";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { Toast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { storageService } from "@/services/storageService";
import { locationService, LocationSuggestion, LocationComponents } from "@/services/locationService";
import { AddressSearch } from "@/components/location/AddressSearch";
import { AddressLocation } from "@/types";

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

  // Location search states
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [selectedLocationComponents, setSelectedLocationComponents] = useState<LocationComponents | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    formattedAddress: "",
    latitude: 26.8467,
    longitude: 80.9462,
    locationSource: "search" as "gps" | "search",
    deliveryRadiusKm: 5,
    openingTime: "09:00 AM",
    closingTime: "11:00 PM",
    status: "OPEN" as "OPEN" | "CLOSED" | "BUSY",
    managerName: "",
    managerEmail: "",
    password: ""
  });

  // Debounced location search effect (450ms)
  useEffect(() => {
    if (!locationSearchQuery || locationSearchQuery.trim().length < 2) {
      setLocationSuggestions([]);
      setIsSearchingLocation(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      const results = await locationService.searchLocations(locationSearchQuery);
      setLocationSuggestions(results.slice(0, 10)); // Max 10 suggestions
      setIsSearchingLocation(false);
      setShowSuggestionsDropdown(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenDrawer = (branch?: BranchModel) => {
    if (branch) {
      setEditingBranch(branch);
      const initialAddress = branch.location?.formattedAddress || "";
      setFormData({
        name: branch.name || "",
        phone: branch.phone || "",
        email: branch.email || "",
        formattedAddress: initialAddress,
        latitude: branch.location?.latitude || branch.latitude || 26.8467,
        longitude: branch.location?.longitude || branch.longitude || 80.9462,
        locationSource: branch.locationSource || branch.location?.locationSource || "search",
        deliveryRadiusKm: branch.deliveryRadiusKm || 5,
        openingTime: branch.openingTime || "09:00 AM",
        closingTime: branch.closingTime || "11:00 PM",
        status: branch.status || "OPEN",
        managerName: branch.managerName || "",
        managerEmail: branch.managerEmail || "",
        password: ""
      });
      setLocationSearchQuery(initialAddress);
      setSelectedLocationComponents({
        country: branch.location?.country || "",
        state: branch.location?.state || "Uttar Pradesh",
        district: branch.location?.district || "",
        city: branch.location?.city || "Kanpur",
        subLocality: branch.location?.subLocality || "",
        locality: branch.location?.locality || "",
        village: branch.location?.village || "",
        street: branch.location?.street || "",
        postalCode: branch.location?.postalCode || branch.location?.pincode || "208001"
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: "",
        phone: "+91 98765 43210",
        email: "branch@spicykingdom.com",
        formattedAddress: "Kidwai Nagar, Kanpur, Uttar Pradesh, India",
        latitude: 26.4499,
        longitude: 80.3318,
        locationSource: "search",
        deliveryRadiusKm: 5,
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
        status: "OPEN",
        managerName: "Rahul Manager",
        managerEmail: `manager${Date.now().toString().slice(-4)}@spicykingdom.com`,
        password: "ManagerPass#123"
      });
      setLocationSearchQuery("Kidwai Nagar, Kanpur, Uttar Pradesh, India");
      setSelectedLocationComponents({
        country: "India",
        state: "Uttar Pradesh",
        district: "Kanpur Nagar",
        city: "Kanpur",
        subLocality: "Kidwai Nagar",
        locality: "Kidwai Nagar",
        village: "",
        street: "",
        postalCode: "208011"
      });
    }
    setLocationSuggestions([]);
    setShowSuggestionsDropdown(false);
    setBranchImageFile(null);
    setIsDrawerOpen(true);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      formattedAddress: suggestion.formattedAddress,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    }));
    setLocationSearchQuery(suggestion.formattedAddress);
    setSelectedLocationComponents(suggestion.locationComponents);
    setShowSuggestionsDropdown(false);
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
      const locationObj = {
        formattedAddress: formData.formattedAddress,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        locationSource: formData.locationSource || "search",
        country: selectedLocationComponents?.country || "",
        state: selectedLocationComponents?.state || (editingBranch?.location?.state || "Uttar Pradesh"),
        district: selectedLocationComponents?.district || (editingBranch?.location?.district || ""),
        city: selectedLocationComponents?.city || (editingBranch?.location?.city || "Kanpur"),
        subLocality: selectedLocationComponents?.subLocality || (editingBranch?.location?.subLocality || ""),
        locality: selectedLocationComponents?.locality || (editingBranch?.location?.locality || ""),
        village: selectedLocationComponents?.village || (editingBranch?.location?.village || ""),
        street: selectedLocationComponents?.street || (editingBranch?.location?.street || ""),
        postalCode: selectedLocationComponents?.postalCode || (editingBranch?.location?.postalCode || "208001"),
        pincode: selectedLocationComponents?.postalCode || (editingBranch?.location?.postalCode || "208001")
      };

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
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        locationSource: formData.locationSource || "search",
        location: locationObj as any
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

          {/* Address Location Picker with GPS & Autocomplete */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <AddressSearch
              required
              value={{
                formattedAddress: formData.formattedAddress,
                latitude: formData.latitude,
                longitude: formData.longitude,
                city: selectedLocationComponents?.city || "Kanpur",
                state: selectedLocationComponents?.state || "Uttar Pradesh",
                pincode: selectedLocationComponents?.postalCode || "208001",
                locationSource: formData.locationSource
              }}
              onChange={(loc: AddressLocation) => {
                setFormData((prev) => ({
                  ...prev,
                  formattedAddress: loc.formattedAddress,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  locationSource: loc.locationSource || "search"
                }));
                if (loc.city || loc.state || loc.pincode) {
                  setSelectedLocationComponents((prev) => ({
                    country: loc.country || prev?.country || "India",
                    state: loc.state || prev?.state || "Uttar Pradesh",
                    district: loc.district || prev?.district || "",
                    city: loc.city || prev?.city || "Kanpur",
                    subLocality: loc.subLocality || prev?.subLocality || "",
                    locality: loc.locality || prev?.locality || "",
                    village: loc.village || prev?.village || "",
                    street: loc.street || prev?.street || "",
                    postalCode: loc.pincode || loc.postalCode || prev?.postalCode || "208001"
                  }));
                }
              }}
            />

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Radius (KM) *</label>
              <input
                type="number"
                value={formData.deliveryRadiusKm}
                onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
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
