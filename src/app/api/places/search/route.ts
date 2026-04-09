import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!query) {
    return NextResponse.json({ error: "Missing place query." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY is required to search places." },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Google Maps place search failed.");
    }

    const data = (await response.json()) as {
      results?: Array<{
        name: string;
        formatted_address: string;
        geometry?: { location?: { lat: number; lng: number } };
      }>;
      status?: string;
      error_message?: string;
    };

    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(data.error_message ?? `Place search returned ${data.status}.`);
    }

    return NextResponse.json({
      results: (data.results ?? []).slice(0, 5).map((result) => ({
        name: result.name,
        address: result.formatted_address,
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.formatted_address)}`
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search places." },
      { status: 500 }
    );
  }
}
