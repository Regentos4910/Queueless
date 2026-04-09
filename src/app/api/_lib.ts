import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { getDistanceInMeters, getTravelTimeInMinutes } from "@/lib/geolocation";
import { buildAnalytics } from "@/lib/analyticsEngine";
import { getRollingMedian } from "@/lib/medianService";
import { allocateToken, normalizeWaitingTokenOrder } from "@/lib/queueEngine";
import type { Facility } from "@/types/facility";
import type { QueueToken } from "@/types/token";

export { FieldValue, Timestamp, buildAnalytics, getDistanceInMeters, getTravelTimeInMinutes, getRollingMedian, allocateToken, normalizeWaitingTokenOrder };

export function db() {
  return getAdminDb();
}

export async function getFacility(facilityId: string): Promise<Facility> {
  const snapshot = await db().collection("facilities").doc(facilityId).get();

  if (!snapshot.exists) {
    throw new Error("Facility not found.");
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Facility, "id">)
  };
}

export async function getFacilityTokens(facilityId: string): Promise<QueueToken[]> {
  const snapshot = await db()
    .collection("tokens")
    .where("facilityId", "==", facilityId)
    .orderBy("tokenNumber", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<QueueToken, "id">)
  }));
}

export async function renumberWaitingTokens(facilityId: string) {
  const allTokens = await getFacilityTokens(facilityId);
  const servingToken = allTokens.find((token) => token.status === "serving") ?? null;
  const waitingTokens = allTokens.filter((token) => token.status === "waiting");
  const normalized = normalizeWaitingTokenOrder(waitingTokens, servingToken);
  const batch = db().batch();

  normalized.forEach((token) => {
    batch.update(db().collection("tokens").doc(token.id), {
      tokenNumber: token.tokenNumber
    });
  });

  await batch.commit();
}
