"use client";

import React, { useState } from "react";
import { Tag, Plus, X } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { Offer } from "@/types";

export default function BranchManagerOffersPage() {
  const user = useStore((state) => state.user);
  const offers = useStore((state) => state.offers);
  const addOffer = useStore((state) => state.addOffer);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercentage: 15
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: Offer = {
      id: "off-" + Date.now(),
      title: formData.title,
      description: formData.description,
      banner: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
      type: "FLAT_DISCOUNT",
      discountPercentage: Number(formData.discountPercentage),
      branchId: user?.branchId || "branch-1",
      status: "ACTIVE"
    };
    addOffer(newOffer);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-600" /> Branch Offers & Promotions
          </h1>
          <p className="text-xs text-slate-500">Local deals & festival discounts for your branch</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((off) => (
          <div key={off.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">{off.title}</h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                {off.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">{off.description}</p>
            <div className="text-xs font-bold text-amber-600">
              {off.discountPercentage}% Discount Applied
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create Branch Offer</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Weekend Biryani Combo"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
