"use client";

import React, { useState } from "react";
import { Settings, ShieldCheck, Check } from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export default function AdminSettingsPage() {
  const user = useStore((state) => state.user);
  const [platformName, setPlatformName] = useState("BingeBite Admin");
  const [supportEmail, setSupportEmail] = useState("support@bingebite.com");
  const [supportPhone, setSupportPhone] = useState("+91 9876543210");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" /> System & Platform Settings
        </h1>
        <p className="text-xs text-slate-500">Configure global platform metadata, support contacts, and system parameters</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm max-w-xl space-y-5">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Platform settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Support Contact Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Helpline Phone Number</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all"
            >
              Save Platform Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
