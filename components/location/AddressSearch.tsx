"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Check, Navigation, AlertCircle, X, Globe } from "lucide-react";
import { AddressLocation } from "@/types";
import { locationService, LocationSuggestion } from "@/services/locationService";

interface AddressSearchProps {
  value?: AddressLocation;
  onChange: (location: AddressLocation) => void;
  placeholder?: string;
  required?: boolean;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  placeholder = "Search location (e.g. Raniya Kanpur Dehat, Civil Lines)...",
  required = false
}) => {
  const [query, setQuery] = useState(value?.formattedAddress || value?.address || "");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AddressLocation | null>(value || null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Dedicated string inputs for Latitude and Longitude for manual coordinate editing
  const [latInput, setLatInput] = useState<string>(
    value?.latitude !== undefined ? String(value.latitude) : ""
  );
  const [lngInput, setLngInput] = useState<string>(
    value?.longitude !== undefined ? String(value.longitude) : ""
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize when value changes externally
  useEffect(() => {
    if (value && (value.formattedAddress || value.address) !== query && !isOpen) {
      setQuery(value.formattedAddress || value.address || "");
      setSelectedLocation(value);
      if (value.latitude !== undefined) setLatInput(String(value.latitude));
      if (value.longitude !== undefined) setLngInput(String(value.longitude));
    }
  }, [value]);

  // Click outside listener to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced address search using Google Places Autocomplete (with OSM fallback)
  useEffect(() => {
    if (!query || query.trim().length < 2 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await locationService.searchLocations(query);
        setSuggestions(results);
      } catch (err) {
        console.error("[AddressSearch] Location search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelectSuggestion = async (item: LocationSuggestion) => {
    setGpsError(null);
    setIsDetailsLoading(true);

    try {
      let finalLat = item.latitude;
      let finalLng = item.longitude;
      let formattedAddr = item.formattedAddress;
      let city = item.locationComponents.city;
      let state = item.locationComponents.state;
      let pincode = item.locationComponents.postalCode;
      let country = item.locationComponents.country;
      let district = item.locationComponents.district;
      let subLocality = item.locationComponents.subLocality;
      let locality = item.locationComponents.locality;
      let street = item.locationComponents.street;

      // If this is a Google suggestion with a placeId, fetch complete Place Details
      if (item.placeId) {
        const details = await locationService.getGooglePlaceDetails(item.placeId);
        if (details) {
          if (details.latitude) finalLat = details.latitude;
          if (details.longitude) finalLng = details.longitude;
          if (details.formattedAddress) formattedAddr = details.formattedAddress;
          if (details.city) city = details.city;
          if (details.state) state = details.state;
          if (details.pincode || details.postalCode) pincode = details.pincode || details.postalCode;
          if (details.country) country = details.country;
          if (details.district) district = details.district;
          if (details.subLocality) subLocality = details.subLocality;
          if (details.locality) locality = details.locality;
          if (details.street) street = details.street;
        }
      }

      setLatInput(String(finalLat));
      setLngInput(String(finalLng));

      const locationObj: AddressLocation = {
        address: formattedAddr,
        formattedAddress: formattedAddr,
        latitude: finalLat,
        longitude: finalLng,
        city,
        state,
        pincode,
        country,
        district,
        subLocality,
        locality,
        street,
        source: "search",
        locationSource: "search"
      };

      setSelectedLocation(locationObj);
      setQuery(formattedAddr);
      setIsOpen(false);
      onChange(locationObj);
    } catch (err) {
      console.error("[AddressSearch] Error fetching place details:", err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const fetchPosition = (highAccuracy: boolean): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: highAccuracy,
        maximumAge: 0,
        timeout: highAccuracy ? 7000 : 12000
      });
    });
  };

  const handleCurrentLocation = async () => {
    setGpsError(null);

    if (typeof window === "undefined" || !navigator || !navigator.geolocation) {
      const msg = "Browser does not support Geolocation. Please use manual search.";
      setGpsError(msg);
      return;
    }

    setIsGpsLoading(true);

    try {
      let pos: GeolocationPosition;
      try {
        pos = await fetchPosition(true);
      } catch (highAccErr: any) {
        if (highAccErr && highAccErr.code === 3) {
          pos = await fetchPosition(false);
        } else {
          throw highAccErr;
        }
      }

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLatInput(String(lat));
      setLngInput(String(lng));

      const fallbackAddress = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      let freshLocation: AddressLocation = {
        address: fallbackAddress,
        formattedAddress: fallbackAddress,
        latitude: lat,
        longitude: lng,
        city: "",
        state: "",
        pincode: "",
        source: "gps",
        locationSource: "gps"
      };

      setSelectedLocation(freshLocation);
      setQuery(fallbackAddress);
      onChange(freshLocation);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const state = addr.state || "";
          const pincode = addr.postcode || "";
          const formattedAddr = data.display_name || fallbackAddress;

          freshLocation = {
            address: formattedAddr,
            formattedAddress: formattedAddr,
            latitude: lat,
            longitude: lng,
            city,
            state,
            pincode,
            source: "gps",
            locationSource: "gps"
          };

          setSelectedLocation(freshLocation);
          setQuery(formattedAddr);
          onChange(freshLocation);
        }
      } catch (e) {
        console.warn("[GPS] Reverse geocoding fallback error:", e);
      }
    } catch (err: any) {
      let errorMsg = "Unable to retrieve GPS location.";
      if (err && typeof err.code === "number") {
        switch (err.code) {
          case 1:
            errorMsg =
              "GPS permission denied by browser. Set location permission to 'Allow' in your browser settings, then try again.";
            break;
          case 2:
            errorMsg = "GPS position unavailable. Please check your device location settings.";
            break;
          case 3:
            errorMsg = "GPS location request timed out. Please try again or use manual search.";
            break;
          default:
            errorMsg = err.message || errorMsg;
            break;
        }
      } else {
        errorMsg = err?.message || errorMsg;
      }
      setGpsError(errorMsg);
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleLatInputChange = (val: string) => {
    setLatInput(val);
    const parsedLat = parseFloat(val);
    const parsedLng = parseFloat(lngInput);

    const latVal = isNaN(parsedLat) ? 0 : parsedLat;
    const lngVal = isNaN(parsedLng) ? 0 : parsedLng;

    const loc: AddressLocation = {
      address: selectedLocation?.address || query || `Location (${latVal}, ${lngVal})`,
      formattedAddress: selectedLocation?.formattedAddress || query || `Location (${latVal}, ${lngVal})`,
      latitude: latVal,
      longitude: lngVal,
      city: selectedLocation?.city || "",
      state: selectedLocation?.state || "",
      pincode: selectedLocation?.pincode || "",
      country: selectedLocation?.country || "",
      district: selectedLocation?.district || "",
      subLocality: selectedLocation?.subLocality || "",
      source: selectedLocation?.source || "search",
      locationSource: selectedLocation?.locationSource || "search"
    };

    setSelectedLocation(loc);
    onChange(loc);
  };

  const handleLngInputChange = (val: string) => {
    setLngInput(val);
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(val);

    const latVal = isNaN(parsedLat) ? 0 : parsedLat;
    const lngVal = isNaN(parsedLng) ? 0 : parsedLng;

    const loc: AddressLocation = {
      address: selectedLocation?.address || query || `Location (${latVal}, ${lngVal})`,
      formattedAddress: selectedLocation?.formattedAddress || query || `Location (${latVal}, ${lngVal})`,
      latitude: latVal,
      longitude: lngVal,
      city: selectedLocation?.city || "",
      state: selectedLocation?.state || "",
      pincode: selectedLocation?.pincode || "",
      country: selectedLocation?.country || "",
      district: selectedLocation?.district || "",
      subLocality: selectedLocation?.subLocality || "",
      source: selectedLocation?.source || "search",
      locationSource: selectedLocation?.locationSource || "search"
    };

    setSelectedLocation(loc);
    onChange(loc);
  };

  const activeSource = selectedLocation?.source || selectedLocation?.locationSource || "search";

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* GPS Error Alert */}
      {gpsError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Address Input & Controls */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Branch Location Setup {required && <span className="text-rose-500">*</span>}
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Address Input Field */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
              <MapPin className="w-4 h-4" />
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
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
            />
            {(isLoading || isDetailsLoading) && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              </div>
            )}

            {/* Suggestion Dropdown */}
            {isOpen && (suggestions.length > 0 || isLoading) && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                {isLoading && suggestions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    Searching Google Maps...
                  </div>
                ) : (
                  suggestions.map((item, idx) => (
                    <button
                      key={item.placeId || `${item.formattedAddress}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left p-2.5 hover:bg-emerald-50/80 transition-colors flex items-start gap-2.5 text-xs group"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {item.primaryName}
                          </p>
                          {item.source === "google" && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 shrink-0">
                              Google Maps
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 line-clamp-1 text-[11px] mt-0.5">
                          {item.formattedAddress || item.secondaryAddress}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Use Current Location Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isGpsLoading}
            title="Fetch live location from browser GPS"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            {isGpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 fill-white/20" />
            )}
            <span>Use Current Location</span>
          </button>
        </div>
      </div>

      {/* Editable Latitude & Longitude Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Latitude <span className="text-[10px] text-slate-400 font-mono">(Decimal Deg)</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={latInput}
            onChange={(e) => handleLatInputChange(e.target.value)}
            placeholder="e.g. 26.8467"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Longitude <span className="text-[10px] text-slate-400 font-mono">(Decimal Deg)</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={lngInput}
            onChange={(e) => handleLngInputChange(e.target.value)}
            placeholder="e.g. 80.9462"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Selected Location Details Preview Box */}
      {selectedLocation && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200/70 pb-2">
            <span className="flex items-center gap-1.5 text-slate-900">
              <Check className="w-4 h-4 text-emerald-600" /> Selected Location Details
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                activeSource === "gps"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {activeSource === "gps" ? (
                <>
                  <Navigation className="w-3 h-3 text-emerald-600" /> GPS Location
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-blue-600" /> Google Address
                </>
              )}
            </span>
          </div>

          <div className="space-y-1 text-slate-700">
            <p className="font-medium text-slate-900 line-clamp-2">
              {selectedLocation.formattedAddress ||
                selectedLocation.address ||
                `Location (${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)})`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1.5 text-slate-600 border-t border-slate-100">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">City / Town</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {selectedLocation.city || selectedLocation.district || "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">State</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {selectedLocation.state || "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Pincode</span>
                <span className="font-semibold text-slate-800 font-mono truncate block">
                  {selectedLocation.pincode || selectedLocation.postalCode || "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Lat, Lng</span>
                <span className="font-semibold text-slate-800 font-mono truncate block">
                  {selectedLocation.latitude ? selectedLocation.latitude.toFixed(4) : "0.0000"},{" "}
                  {selectedLocation.longitude ? selectedLocation.longitude.toFixed(4) : "0.0000"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
