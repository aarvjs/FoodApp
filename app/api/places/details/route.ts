import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("place_id");

  if (!placeId) {
    return NextResponse.json({ error: "Missing place_id parameter" }, { status: 400 });
  }

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBeIlXiJwZa8kWK0OTczQ0vEuarTHOzThA";

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=address_component,formatted_address,geometry,place_id&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Place Details HTTP error: ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "OK") {
      console.warn("[Google Place Details Status]", data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || `Place details request status: ${data.status}` },
        { status: 400 }
      );
    }

    const result = data.result || {};
    const components: any[] = result.address_components || [];

    const getComponent = (type: string) => {
      const comp = components.find((c: any) => c.types && c.types.includes(type));
      return comp ? comp.long_name : "";
    };

    const country = getComponent("country");
    const state = getComponent("administrative_area_level_1");
    const district = getComponent("administrative_area_level_2");

    const city =
      getComponent("locality") ||
      getComponent("administrative_area_level_3") ||
      getComponent("sublocality_level_1") ||
      district;

    const subLocality =
      getComponent("sublocality_level_1") ||
      getComponent("sublocality_level_2") ||
      getComponent("neighborhood") ||
      "";

    const locality =
      getComponent("locality") ||
      getComponent("sublocality_level_1") ||
      getComponent("neighborhood") ||
      "";

    const street =
      getComponent("route") ||
      getComponent("premise") ||
      getComponent("subpremise") ||
      "";

    const postalCode = getComponent("postal_code");

    const lat = result.geometry?.location?.lat ?? 0;
    const lng = result.geometry?.location?.lng ?? 0;

    return NextResponse.json({
      placeId: result.place_id || placeId,
      formattedAddress: result.formatted_address || "",
      latitude: lat,
      longitude: lng,
      city,
      state,
      district,
      country,
      postalCode,
      pincode: postalCode,
      subLocality,
      locality,
      street
    });
  } catch (error: any) {
    console.error("[Google Place Details Error]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
