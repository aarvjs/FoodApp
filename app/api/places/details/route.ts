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
    "AIzaSyC4zEkcRePCJWM0WMtZs1IIGEbxnvKMjJM";

  try {
    // 1. Query Google Places API (New) Place Details endpoint
    try {
      const cleanPlaceId = placeId.replace(/^places\//, "");
      const newUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(cleanPlaceId)}`;

      const newRes = await fetch(newUrl, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,location,addressComponents"
        }
      });

      if (newRes.ok) {
        const newData = await newRes.json();
        if (newData && (newData.formattedAddress || newData.location)) {
          const components: any[] = newData.addressComponents || [];
          const getComp = (type: string) => {
            const comp = components.find((c: any) => c.types && c.types.includes(type));
            return comp ? comp.longText || comp.shortText || "" : "";
          };

          const country = getComp("country");
          const state = getComp("administrative_area_level_1");
          const district = getComp("administrative_area_level_2");
          const city =
            getComp("locality") ||
            getComp("administrative_area_level_3") ||
            getComp("sublocality_level_1") ||
            district;
          const subLocality =
            getComp("sublocality_level_1") ||
            getComp("sublocality_level_2") ||
            getComp("neighborhood");
          const locality =
            getComp("locality") ||
            getComp("sublocality_level_1") ||
            getComp("neighborhood");
          const street = getComp("route") || getComp("premise");
          const postalCode = getComp("postal_code");

          return NextResponse.json({
            placeId: newData.id || placeId,
            formattedAddress: newData.formattedAddress || newData.displayName?.text || "",
            latitude: newData.location?.latitude ?? 0,
            longitude: newData.location?.longitude ?? 0,
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
        }
      } else {
        const errText = await newRes.text();
        console.warn("[Google Place Details (New) Status]", newRes.status, errText);
      }
    } catch (newErr) {
      console.warn("[Google Place Details (New) Fetch Error]", newErr);
    }

    // 2. Query Google Places Legacy Details API if new API fails
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=address_component,formatted_address,geometry,place_id&key=${apiKey}`;

    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "OK") {
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
      } else {
        console.warn("[Google Place Details Legacy Status]", data.status, data.error_message);
      }
    }

    return NextResponse.json({
      placeId,
      formattedAddress: "",
      latitude: 0,
      longitude: 0,
      city: "",
      state: "",
      district: "",
      country: "",
      postalCode: "",
      pincode: "",
      subLocality: "",
      locality: "",
      street: ""
    });
  } catch (error: any) {
    console.error("[Google Place Details Error]", error);
    return NextResponse.json({
      placeId,
      formattedAddress: "",
      latitude: 0,
      longitude: 0,
      city: "",
      state: "",
      district: "",
      country: "",
      postalCode: "",
      pincode: "",
      subLocality: "",
      locality: "",
      street: ""
    });
  }
}
