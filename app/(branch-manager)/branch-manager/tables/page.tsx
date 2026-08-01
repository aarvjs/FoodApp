"use client";

import React, { useState } from "react";
import { Grid3X3, Plus, X, Trash2, Calendar, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerTablesPage() {
  const user = useStore((state) => state.user);
  const tables = useStore((state) => state.tables);
  const tableBookings = useStore((state) => state.tableBookings);
  const addTable = useStore((state) => state.addTable);
  const deleteTable = useStore((state) => state.deleteTable);
  const createTableBooking = useStore((state) => state.createTableBooking);
  const updateBookingStatus = useStore((state) => state.updateBookingStatus);

  const managerBranchId = user?.assignedBranchId || user?.branchId;
  const branchTables = tables.filter((t) => !managerBranchId || t.branchId === managerBranchId);
  const branchBookings = tableBookings.filter((b) => !managerBranchId || b.branchId === managerBranchId);

  const [activeTab, setActiveTab] = useState<"TABLES" | "BOOKINGS">("TABLES");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    capacity: 4,
    section: "Main Dining",
    type: "Indoor" as "Indoor" | "Outdoor",
    environment: "AC" as "AC" | "Non AC"
  });

  const [bookingForm, setBookingForm] = useState({
    tableId: "",
    customerName: "",
    customerPhone: "",
    date: new Date().toISOString().split("T")[0],
    time: "08:00 PM",
    guests: 2
  });

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addTable({
        branchId: user?.branchId || "",
        tableNumber: tableForm.tableNumber,
        capacity: Number(tableForm.capacity),
        section: tableForm.section,
        type: tableForm.type,
        environment: tableForm.environment,
        status: "AVAILABLE"
      });
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Failed to create table: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedTable = branchTables.find((t) => t.id === bookingForm.tableId);
      await createTableBooking({
        branchId: user?.branchId || "",
        tableId: bookingForm.tableId,
        tableNumber: selectedTable?.tableNumber || "T-101",
        customerName: bookingForm.customerName,
        customerPhone: bookingForm.customerPhone,
        date: bookingForm.date,
        time: bookingForm.time,
        guests: Number(bookingForm.guests),
        status: "CONFIRMED"
      });
      setIsBookingModalOpen(false);
    } catch (err: any) {
      alert("Failed to book table: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-amber-600" /> Branch Tables & Reservations
          </h1>
          <p className="text-xs text-slate-500">Manage floor seating & customer table reservations for your branch</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab("TABLES")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${activeTab === "TABLES" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              Tables ({branchTables.length})
            </button>
            <button
              onClick={() => setActiveTab("BOOKINGS")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${activeTab === "BOOKINGS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              Reservations ({branchBookings.length})
            </button>
          </div>

          {activeTab === "TABLES" ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Table
            </button>
          ) : (
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> New Booking
            </button>
          )}
        </div>
      </div>

      {activeTab === "TABLES" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {branchTables.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">{t.tableNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  t.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" :
                  t.status === "BOOKED" ? "bg-purple-100 text-purple-800" :
                  "bg-rose-100 text-rose-800"
                }`}>
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Capacity: <strong className="text-slate-900">{t.capacity} Persons</strong></p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{t.type || "Indoor"}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{t.environment || "AC"}</span>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button onClick={() => deleteTable(t.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "BOOKINGS" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar text-xs">
          <table className="w-full text-left text-slate-700 whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Table #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{b.tableNumber}</td>
                  <td className="px-4 py-3 font-medium">{b.customerName}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{b.customerPhone}</td>
                  <td className="px-4 py-3">{b.date} @ {b.time}</td>
                  <td className="px-4 py-3 font-bold">{b.guests} Guests</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.status === "ACCEPTED" || b.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" :
                      b.status === "PENDING" ? "bg-amber-100 text-amber-900" :
                      b.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {b.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(b.id, "ACCEPTED", b.tableId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, "REJECTED", b.tableId)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded font-bold text-[10px]"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(b.status === "ACCEPTED" || b.status === "CONFIRMED") && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(b.id, "COMPLETED", b.tableId)}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold text-[10px]"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, "NO_SHOW", b.tableId)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded font-bold text-[10px]"
                        >
                          No Show
                        </button>
                      </>
                    )}
                    {b.status !== "CANCELLED" && b.status !== "REJECTED" && b.status !== "COMPLETED" && b.status !== "NO_SHOW" && (
                      <button
                        onClick={() => updateBookingStatus(b.id, "CANCELLED", b.tableId)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded font-bold text-[10px]"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Table for Branch</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveTable} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Table Number *</label>
                <input
                  type="text"
                  required
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  placeholder="e.g. Table-01"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={tableForm.section}
                    onChange={(e) => setTableForm({ ...tableForm, section: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow">Save Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create Reservation</h2>
              <button onClick={() => setIsBookingModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose Table *</label>
                <select
                  required
                  value={bookingForm.tableId}
                  onChange={(e) => setBookingForm({ ...bookingForm, tableId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">Select Table</option>
                  {branchTables.map((t) => (
                    <option key={t.id} value={t.id}>{t.tableNumber} ({t.capacity} Px)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={bookingForm.customerName}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Phone *</label>
                <input
                  type="text"
                  required
                  value={bookingForm.customerPhone}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow">Confirm Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
