import type { Coordinates } from "@/types/facility";

const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceInMeters(a: Coordinates, b: Coordinates) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export async function getTravelTimeInMinutes(origin: Coordinates, destination: Coordinates) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    const distance = getDistanceInMeters(origin, destination);
    const assumedMetersPerMinute = 500;

    return Math.max(2, Math.round(distance / assumedMetersPerMinute));
  }

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destinations", `${destination.lat},${destination.lng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to calculate travel time.");
  }

  const data = (await response.json()) as {
    rows?: Array<{ elements?: Array<{ duration?: { value: number }; status?: string }> }>;
  };

  const durationSeconds = data.rows?.[0]?.elements?.[0]?.duration?.value;

  if (!durationSeconds) {
    throw new Error("Travel time was not available for the selected route.");
  }

  return Math.max(1, Math.round(durationSeconds / 60));
}
