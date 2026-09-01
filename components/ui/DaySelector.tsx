"use client";

import React from "react";

export const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  label?: string;
}

export function DaySelector({ selectedDays = ALL_DAYS, onChange, label = "Available Days *" }: DaySelectorProps) {
  const isAllSelected = ALL_DAYS.every((d) => selectedDays.includes(d));

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      // Don't allow deselecting all days completely if at least one is needed, or allow toggle
      const newDays = selectedDays.filter((d) => d !== day);
      onChange(newDays);
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...ALL_DAYS]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 text-xs">
          {label}
        </label>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          {isAllSelected ? "Deselect All" : "Select All Days"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ALL_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 font-medium">
        {selectedDays.length === 7
          ? "Available everyday (Mon – Sun)"
          : selectedDays.length === 0
          ? "⚠️ No days selected (Product will be unavailable)"
          : `Available on ${selectedDays.join(", ")}`}
      </p>
    </div>
  );
}
