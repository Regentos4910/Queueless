import type { Facility } from "@/types/facility";

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
    throw new Error("Failed to create facility.");
  }

  return (await response.json()) as { facilityId: string };
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
