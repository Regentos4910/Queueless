import type { AnalyticsPayload } from "@/types/analytics";

export async function fetchAnalytics(facilityId: string) {
  const response = await fetch(`/api/analytics?facilityId=${facilityId}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics.");
  }

  return (await response.json()) as AnalyticsPayload;
}
