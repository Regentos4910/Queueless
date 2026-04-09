import type { Facility } from "@/types/facility";

type PlaceSearchResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapsUrl: string;
};

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function createFacility(payload: {
  name: string;
  lat: number;
  lng: number;
  medianServiceTime: number;
}) {
  const response = await fetch("/api/facilities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to create facility."));
  }

  return (await response.json()) as { facilityId: string };
}

export async function searchPlaces(query: string) {
  const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to search places."));
  }

  return (await response.json()) as { results: PlaceSearchResult[] };
}

export function enrichFacilities(facilities: Facility[], waitingCounts: Map<string, number>) {
  return facilities.map((facility) => {
    const queueSize = waitingCounts.get(facility.id) ?? 0;
    const serviceTime = facility.adminOverrideTime ?? facility.medianServiceTime;

    return {
      ...facility,
      queueSize,
      waitingTime: queueSize * serviceTime
    };
  });
}
