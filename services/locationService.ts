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
      console.warn("locationService.searchGooglePlaces error:", e);
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
        console.warn("getGooglePlaceDetails error:", data.error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("locationService.getGooglePlaceDetails error:", e);
      return null;
    }
  },

  /**
   * Primary location search: Uses Google Places first, with fallback to OpenStreetMap Nominatim
   */
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];

    // 1. Try Google Places Autocomplete
    const googleResults = await locationService.searchGooglePlaces(query);
    if (googleResults.length > 0) {
      return googleResults;
    }

    // 2. Fallback to OpenStreetMap Nominatim if Google Places has no results or fails
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&addressdetails=1&limit=10&countrycodes=in`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "FoodOrderingAdmin/1.0"
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => {
        const addr = item.address || {};

        const primaryName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          addr.residential ||
          addr.road ||
          addr.village ||
          addr.town ||
          addr.city ||
          item.name ||
          query;

        const secondaryParts = [
          addr.city || addr.town || addr.municipality || addr.county || addr.state_district,
          addr.state,
          addr.country
        ].filter((val, index, self) => Boolean(val) && self.indexOf(val) === index && val !== primaryName);

        const secondaryAddress = secondaryParts.join(", ");

        return {
          primaryName,
          secondaryAddress: secondaryAddress || primaryName,
          formattedAddress: item.display_name || `${primaryName}, ${secondaryAddress}`,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          source: "osm" as const,
          locationComponents: {
            country: addr.country || "",
            state: addr.state || "",
            district: addr.county || addr.state_district || addr.district || "",
            city: addr.city || addr.town || addr.municipality || addr.city_district || "",
            subLocality: addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || "",
            locality: addr.locality || addr.suburb || addr.village || "",
            village: addr.village || addr.hamlet || "",
            street: addr.road || addr.pedestrian || "",
            postalCode: addr.postcode || ""
          }
        };
      });
    } catch (error) {
      console.warn("locationService OSM fallback error:", error);
      return [];
    }
  }
};
