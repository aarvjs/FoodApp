"use client";

import React, { useState, useEffect } from "react";
import { 
  Bike, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Loader2, 
  RefreshCw,
  MoreVertical,
  Check,
  Ban
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Rider, RiderAccountStatus } from "@/types";
import { riderService } from "@/services/riderService";

export default function AdminDeliveryPartnersPage() {
  const branches = useStore((state) => state.branches);

  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");

  // Confirmation Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [targetStatus, setTargetStatus] = useState<RiderAccountStatus | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Subscribe to real-time Firestore riders collection
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = riderService.subscribeToRiders(
      (fetchedRiders) => {
        setRiders(fetchedRiders);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load riders:", err);
        setError("Failed to fetch riders from database: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open confirmation modal for Accept / Reject / Status Change
  const handleOpenConfirmModal = (rider: Rider, status: RiderAccountStatus) => {
    setSelectedRider(rider);
    setTargetStatus(status);
    setShowModal(true);
  };

  // Execute Firestore status update
  const handleConfirmStatusChange = async () => {
    if (!selectedRider || !targetStatus) return;

    setUpdating(true);
    try {
      await riderService.updateRiderStatus(selectedRider.id, targetStatus);
      const actionName = targetStatus === "ACTIVE" ? "approved & activated" : targetStatus === "BLOCKED" ? "rejected / blocked" : targetStatus.toLowerCase();
      showToast(`Rider "${selectedRider.name}" successfully ${actionName}.`, "success");
      setShowModal(false);
      setSelectedRider(null);
      setTargetStatus(null);
    } catch (err: any) {
      showToast("Failed to update rider status: " + (err.message || "Unknown error"), "error");
    } finally {
      setUpdating(false);
    }
  };

  // Filter riders based on search, status tab, and branch
  const filteredRiders = riders.filter((rider) => {
    // Status filter
    if (statusFilter !== "ALL" && rider.status !== statusFilter) {
      return false;
    }
    // Branch filter
    if (selectedBranchId !== "ALL" && rider.branchId !== selectedBranchId && rider.assignedBranchId !== selectedBranchId) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = (rider.name || "").toLowerCase().includes(q);
      const matchPhone = (rider.phone || "").toLowerCase().includes(q);
      const matchEmail = (rider.email || "").toLowerCase().includes(q);
      const matchCity = (rider.city || "").toLowerCase().includes(q);
      const matchBranch = (rider.branchName || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchCity || matchBranch;
    }
    return true;
  });

  // Calculate summary counts
  const totalCount = riders.length;
  const pendingCount = riders.filter((r) => r.status === "PENDING_APPROVAL").length;
  const activeCount = riders.filter((r) => r.status === "ACTIVE").length;
  const blockedCount = riders.filter((r) => r.status === "BLOCKED" || r.status === "SUSPENDED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border font-semibold text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === "success" 
              ? "bg-emerald-950 text-emerald-200 border-emerald-800" 
              : "bg-rose-950 text-rose-200 border-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <Bike className="w-5 h-5" />
            </div>
            Delivery Partners
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage rider accounts, review pending applications, and control delivery partner access.
          </p>
        </div>
      </div>

      {/* Pending Approval Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                {pendingCount} Rider Application{pendingCount > 1 ? "s" : ""} Pending Approval
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                New delivery partners are waiting for approval before they can start taking orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("PENDING_APPROVAL")}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
          >
            Review Applications ({pendingCount})
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Partners</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <Bike className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
          pendingCount > 0 ? "border-amber-300 ring-2 ring-amber-500/10 bg-amber-50/30" : "border-slate-200/80"
        }`}>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Approval</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Riders</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Blocked / Suspended</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600">{blockedCount}</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Status Tab Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: "ALL", label: "All Riders", count: totalCount },
            { id: "PENDING_APPROVAL", label: "Pending Approval", count: pendingCount, badge: true },
            { id: "ACTIVE", label: "Active", count: activeCount },
            { id: "BLOCKED", label: "Blocked", count: riders.filter((r) => r.status === "BLOCKED").length },
            { id: "SUSPENDED", label: "Suspended", count: riders.filter((r) => r.status === "SUSPENDED").length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Branch Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by rider name, phone, email, city or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {branches.length > 0 && (
            <div className="w-full sm:w-56 shrink-0">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || b.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Riders List / Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Connecting to Firestore riders collection...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-bold text-rose-700">{error}</p>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="py-16 text-center space-y-2 px-4">
            <Bike className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No Delivery Partners Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "ALL" || selectedBranchId !== "ALL"
                ? "No riders matched your current filter criteria. Try clearing your search or status filter."
                : "No riders are currently registered in the Firestore 'riders' collection."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Rider Info</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location & Branch</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRiders.map((rider) => {
                  const isPending = rider.status === "PENDING_APPROVAL";
                  const isActive = rider.status === "ACTIVE";
                  const isBlocked = rider.status === "BLOCKED";
                  const isSuspended = rider.status === "SUSPENDED";

                  return (
                    <tr 
                      key={rider.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Rider Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 overflow-hidden">
                            {rider.profileImage || rider.avatar ? (
                              <img src={rider.profileImage || rider.avatar} alt={rider.name} className="w-full h-full object-cover" />
                            ) : (
                              rider.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              {rider.name}
                              {rider.vehicleType && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {rider.vehicleType}
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {rider.id.slice(0, 10)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-medium text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{rider.phone || "N/A"}</span>
                          </div>
                          {rider.email && rider.email !== "N/A" && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{rider.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location & Branch */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-medium">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{rider.city || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{rider.branchName || "All Branches"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Approval
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                          </span>
                        )}
                        {isBlocked && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Blocked
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Online Availability */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${rider.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                          <span className={`font-bold ${rider.isOnline ? "text-emerald-700" : "text-slate-400"}`}>
                            {rider.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenConfirmModal(rider, "ACTIVE")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                              title="Accept Rider (Set ACTIVE)"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => handleOpenConfirmModal(rider, "BLOCKED")}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                              title="Reject Rider (Set BLOCKED)"
                            >
                              <Ban className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {isActive && (
                              <button
                                onClick={() => handleOpenConfirmModal(rider, "BLOCKED")}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold rounded-lg border border-slate-200 transition-colors"
                              >
                                Block
                              </button>
                            )}
                            {(isBlocked || isSuspended) && (
                              <button
                                onClick={() => handleOpenConfirmModal(rider, "ACTIVE")}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenConfirmModal(rider, "SUSPENDED")}
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Suspend Rider"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedRider && targetStatus && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                Confirm Status Change
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                  {selectedRider.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedRider.name}</p>
                  <p className="text-slate-500">{selectedRider.phone} • {selectedRider.city || "City N/A"}</p>
                </div>
              </div>

              {targetStatus === "ACTIVE" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-semibold space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Accept & Activate Rider
                  </p>
                  <p className="text-[11px] text-emerald-700 font-normal">
                    This rider account status will be set to <strong>ACTIVE</strong>. The rider will be approved and allowed to log in and accept delivery orders.
                  </p>
                </div>
              )}

              {targetStatus === "BLOCKED" && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl font-semibold space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    Reject / Block Rider
                  </p>
                  <p className="text-[11px] text-rose-700 font-normal">
                    This rider account status will be set to <strong>BLOCKED</strong>. The rider will not be allowed to log in or accept delivery assignments.
                  </p>
                </div>
              )}

              {targetStatus === "SUSPENDED" && (
                <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl font-semibold space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-purple-800">
                    <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                    Suspend Rider Account
                  </p>
                  <p className="text-[11px] text-purple-700 font-normal">
                    This rider account status will be set to <strong>SUSPENDED</strong> temporarily.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={updating}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={updating}
                className={`px-5 py-2.5 text-white font-bold rounded-xl shadow flex items-center gap-2 ${
                  targetStatus === "ACTIVE" 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : targetStatus === "BLOCKED" 
                    ? "bg-rose-600 hover:bg-rose-700" 
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                {targetStatus === "ACTIVE" ? "Confirm Accept" : targetStatus === "BLOCKED" ? "Confirm Reject" : "Confirm Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
