"use client";

import React, { useState } from "react";
import { Settings, Store, Clock, Phone, Mail, Check } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerSettingsPage() {
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);
  const updateBranch = useStore((state) => state.updateBranch);

  const assignedBranch = branches.find((b) => b.id === user?.branchId) || branches[0];

  const [status, setStatus] = useState<"OPEN" | "CLOSED" | "BUSY">(assignedBranch?.status || "OPEN");
  const [openingTime, setOpeningTime] = useState(assignedBranch?.openingTime || "10:00 AM");
  const [closingTime, setClosingTime] = useState(assignedBranch?.closingTime || "11:00 PM");
  const [phone, setPhone] = useState(assignedBranch?.phone || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedBranch) {
      updateBranch(assignedBranch.id, {
        status,
        openingTime,
        closingTime,
        phone
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-600" /> Branch Operational Settings
        </h1>
        <p className="text-xs text-slate-500">Manage store status, working hours and phone contact for {assignedBranch?.name}</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-xl space-y-5">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Branch settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Live Operational Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(["OPEN", "CLOSED", "BUSY"] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2.5 rounded-xl font-bold transition-all ${
                    status === st
                      ? st === "OPEN" ? "bg-emerald-600 text-white shadow" : st === "BUSY" ? "bg-amber-600 text-white shadow" : "bg-rose-600 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Opening Hours</label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Closing Hours</label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Phone Line</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition-all"
            >
              Save Branch Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
