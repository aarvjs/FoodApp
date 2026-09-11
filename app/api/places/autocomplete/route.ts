import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [], status: "OK" });
  }

  const query = input.trim();
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyC4zEkcRePCJWM0WMtZs1IIGEbxnvKMjJM";

  let predictions: any[] = [];

  // 1. Query Google Places API (New) Autocomplete
  try {
    const newApiRes = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey
      },
      body: JSON.stringify({
        input: query,
        includedRegionCodes: ["in"]
      })
    });

    if (newApiRes.ok) {
      const newData = await newApiRes.json();
      if (newData.suggestions && Array.isArray(newData.suggestions)) {
        predictions = newData.suggestions
          .map((s: any) => {
            const p = s.placePrediction;
            if (!p) return null;
            const placeId = p.placeId || (p.place ? p.place.replace("places/", "") : "");
            const text = p.text?.text || "";
            const mainText = p.structuredFormat?.mainText?.text || text.split(",")[0] || query;
            const secondaryText = p.structuredFormat?.secondaryText?.text || text || "";
            return {
              placeId,
              mainText,
              secondaryText,
              description: text || `${mainText}, ${secondaryText}`
            };
          })
          .filter(Boolean);
      }
    } else {
      const errorText = await newApiRes.text();
      console.warn("[Google Places API (New) Autocomplete Status]", newApiRes.status, errorText);
    }
  } catch (err) {
    console.warn("[Google Places API (New) Autocomplete Fetch Error]", err);
  }

  // 2. Query Google Places Legacy Autocomplete if predictions empty
  if (predictions.length === 0) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&components=country:in&key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "OK" && Array.isArray(data.predictions)) {
          predictions = data.predictions.map((p: any) => ({
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text || p.description?.split(",")[0] || "",
            secondaryText: p.structured_formatting?.secondary_text || p.description || "",
            description: p.description || ""
          }));
        }
      }
    } catch (err) {
      console.warn("[Google Places Legacy Autocomplete Fetch Error]", err);
    }
  }

  return NextResponse.json({ predictions, status: "OK" });
}
