"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Check, Navigation, AlertCircle } from "lucide-react";
import { AddressLocation } from "@/types";

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressSearchProps {
  value?: AddressLocation;
  onChange: (location: AddressLocation) => void;
  placeholder?: string;
  required?: boolean;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  placeholder = "Search location (e.g. Kanpur, Civil Lines)...",
  required = false
}) => {
  const [query, setQuery] = useState(value?.formattedAddress || "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AddressLocation | null>(value || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize when value changes externally
  useEffect(() => {
    if (value && value.formattedAddress !== query && !isOpen) {
      setQuery(value.formattedAddress);
      setSelectedLocation(value);
    }
  }, [value]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search fetching from Nominatim API
  useEffect(() => {
    if (!query || query.trim().length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5&countrycodes=in`,
          {
            headers: {
              "Accept-Language": "en"
            }
          }
        );
        if (response.ok) {
          const data: NominatimResult[] = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Location search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item: NominatimResult) => {
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || "Kanpur";
    const state = addr.state || "Uttar Pradesh";
    const pincode = addr.postcode || "208001";
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    const locationObj: AddressLocation = {
      formattedAddress: item.display_name,
      latitude: lat,
      longitude: lng,
      city,
      state,
      pincode
    };

    setSelectedLocation(locationObj);
    setQuery(item.display_name);
    setIsOpen(false);
    onChange(locationObj);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          if (res.ok) {
            const data: NominatimResult = await res.json();
            handleSelect(data);
          }
        } catch (e) {
          console.error("Reverse geocoding error:", e);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        console.warn("Geolocation denied or unavailable:", err.message);
      }
    );
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Delivery & Branch Address Search {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
            <MapPin className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-1">
            {isLoading ? (
              <div className="p-1.5 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCurrentLocation}
                title="Use Current Location"
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Suggestion Dropdown */}
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
            {isLoading && suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                Searching map database...
              </div>
            ) : (
              suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3 hover:bg-emerald-50/80 transition-colors flex items-start gap-3 text-xs"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 line-clamp-1">
                      {item.address?.road || item.address?.suburb || item.display_name.split(",")[0]}
                    </p>
                    <p className="text-slate-500 line-clamp-1 text-[11px] mt-0.5">{item.display_name}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Auto-extracted Fields Card */}
      {selectedLocation && (
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-emerald-900 border-b border-emerald-200/50 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Auto-Fetched Location Details
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-200/60 text-emerald-800 rounded-md font-mono">
              LAT: {selectedLocation.latitude.toFixed(4)}, LNG: {selectedLocation.longitude.toFixed(4)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 pt-0.5">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">City</span>
              <span className="font-medium text-slate-900">{selectedLocation.city || "Kanpur"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">State</span>
              <span className="font-medium text-slate-900">{selectedLocation.state || "Uttar Pradesh"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">Pincode</span>
              <span className="font-medium text-slate-900 font-mono">{selectedLocation.pincode || "208001"}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">Coordinates</span>
              <span className="font-medium text-slate-900 font-mono truncate block">
                {selectedLocation.latitude.toFixed(2)}, {selectedLocation.longitude.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
