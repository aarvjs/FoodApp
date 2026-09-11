export interface LocationComponents {
  country: string;
  state: string;
  district: string;
  city: string;
  subLocality: string;
  locality: string;
  village: string;
  street: string;
  postalCode: string;
}

export interface LocationSuggestion {
  primaryName: string;
  secondaryAddress: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  locationComponents: LocationComponents;
  placeId?: string;
  source?: "google" | "osm";
}

export const locationService = {
  /**
   * Search Google Places Autocomplete via Next.js API Route
   */
  searchGooglePlaces: async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return [];

      const data = await res.json();
      if (data.status !== "OK" || !Array.isArray(data.predictions)) return [];

      return data.predictions.map((p: any) => ({
        primaryName: p.mainText || p.description?.split(",")[0] || query,
        secondaryAddress: p.secondaryText || p.description || "",
        formattedAddress: p.description || p.mainText || query,
        latitude: 0,
        longitude: 0,
        placeId: p.placeId,
        source: "google" as const,
        locationComponents: {
          country: "",
          state: "",
          district: "",
          city: "",
          subLocality: "",
          locality: "",
          village: "",
          street: "",
          postalCode: ""
        }
      }));
    } catch (e) {
      console.warn("locationService.searchGooglePlaces API route error:", e);
      return [];
    }
  },

  /**
   * Fetch complete Place Details from Google Places API via Next.js API Route
   */
  getGooglePlaceDetails: async (placeId: string) => {
    if (!placeId) return null;

    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`);
      if (!res.ok) return null;

      const data = await res.json();
      if (data.error) {
        console.warn("getGooglePlaceDetails API route error:", data.error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("locationService.getGooglePlaceDetails error:", e);
      return null;
    }
  },

  /**
   * Primary location search: Exclusively uses Google Places Autocomplete API
   */
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];
    return await locationService.searchGooglePlaces(query);
  }
};
