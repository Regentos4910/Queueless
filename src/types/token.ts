import type { Coordinates } from "@/types/facility";

export type TokenStatus = "waiting" | "serving" | "completed" | "no_show";
export type ArrivalStatus = "on_the_way" | "arrived" | "unknown";

export type QueueToken = {
  id: string;
  facilityId: string;
  tokenNumber: number;
  userName: string;
  phone?: string;
  status: TokenStatus;
  arrivalStatus: ArrivalStatus;
  userLocation?: Coordinates | null;
  eta?: number | null;
  peopleAhead?: number;
  estimatedCallTime?: string | null;
  callTime?: string | null;
  completionTime?: string | null;
  serviceTime?: number | null;
  createdAt?: string | null;
};
