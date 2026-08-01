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
}

export const locationService = {
  /**
   * Search location suggestions using OpenStreetMap Nominatim with granular address components
   */
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&addressdetails=1&limit=10`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "FoodOrderingAdmin/1.0"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch location suggestions");
      }

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

        const country = addr.country || "";
        const state = addr.state || "";
        const district = addr.county || addr.state_district || addr.district || "";
        const city = addr.city || addr.town || addr.municipality || addr.city_district || "";
        const subLocality = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || "";
        const locality = addr.locality || addr.suburb || addr.village || "";
        const village = addr.village || addr.hamlet || "";
        const street = addr.road || addr.pedestrian || "";
        const postalCode = addr.postcode || "";

        return {
          primaryName,
          secondaryAddress: secondaryAddress || primaryName,
          formattedAddress: item.display_name || `${primaryName}, ${secondaryAddress}`,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          locationComponents: {
            country,
            state,
            district,
            city,
            subLocality,
            locality,
            village,
            street,
            postalCode
          }
        };
      });
    } catch (error) {
      console.warn("locationService.searchLocations error:", error);
      return [];
    }
  }
};
