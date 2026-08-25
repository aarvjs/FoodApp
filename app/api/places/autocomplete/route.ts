import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBeIlXiJwZa8kWK0OTczQ0vEuarTHOzThA";

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input.trim()
    )}&components=country:in&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Places Autocomplete HTTP error: ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn("[Google Places Autocomplete Status]", data.status, data.error_message);
      return NextResponse.json({
        predictions: [],
        status: data.status,
        errorMessage: data.error_message
      });
    }

    const predictions = (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text || p.description?.split(",")[0] || "",
      secondaryText: p.structured_formatting?.secondary_text || p.description || "",
      description: p.description || ""
    }));

    return NextResponse.json({ predictions, status: "OK" });
  } catch (error: any) {
    console.error("[Google Places Autocomplete Error]", error);
    return NextResponse.json(
      { predictions: [], status: "ERROR", error: error?.message || "Failed to fetch place suggestions" },
      { status: 500 }
    );
  }
}
