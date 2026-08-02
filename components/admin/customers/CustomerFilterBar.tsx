"use client";

import React, { useState } from "react";
import { Search, Download, RotateCcw, ChevronDown, SlidersHorizontal } from "lucide-react";
import { CustomerFilters } from "@/lib/utils/customerHelper";
import { Restaurant } from "@/types";

interface CustomerFilterBarProps {
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
  availableCities: string[];
  availableStates: string[];
  restaurants: Restaurant[];
  totalResultsCount: number;
}

export function CustomerFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onExportCSV,
  availableCities,
  availableStates,
  restaurants,
  totalResultsCount
}: CustomerFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof CustomerFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.city !== "ALL" ||
    filters.state !== "ALL" ||
    filters.status !== "ALL" ||
    filters.registrationDateRange !== "ALL" ||
    filters.restaurantId !== "ALL" ||
    filters.minRevenue ||
    filters.maxRevenue ||
    filters.minOrders ||
    filters.maxOrders;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Primary Row: Search & Quick Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            placeholder="Search customer by name, mobile, city, state, address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter("searchQuery", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              showAdvanced || hasActiveFilters
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all ml-auto md:ml-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {/* City */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
            <select
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
            <select
              value={filters.state}
              onChange={(e) => updateFilter("state", e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All States</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          {/* Registered Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registered Date</label>
            <select
              value={filters.registrationDateRange}
              onChange={(e) => updateFilter("registrationDateRange", e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_YEAR">This Year</option>
            </select>
          </div>

          {/* Restaurant Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Restaurant</label>
            <select
              value={filters.restaurantId}
              onChange={(e) => updateFilter("restaurantId", e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || r.restaurantName}
                </option>
              ))}
            </select>
          </div>

          {/* Revenue Range */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Revenue Min/Max (₹)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.minRevenue}
                onChange={(e) => updateFilter("minRevenue", e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRevenue}
                onChange={(e) => updateFilter("maxRevenue", e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          {/* Order Count */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Orders Min/Max</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Min"
                value={filters.minOrders}
                onChange={(e) => updateFilter("minOrders", e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxOrders}
                onChange={(e) => updateFilter("maxOrders", e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Showing count indicator */}
      <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between pt-1">
        <span>Showing <strong className="text-slate-900">{totalResultsCount}</strong> customers based on current filters</span>
      </div>
    </div>
  );
}
