import type { Facility } from "@/types/facility";
import type { QueueToken } from "@/types/token";

type AllocationInput = {
  waitingTokens: QueueToken[];
  servingToken?: QueueToken | null;
  facility: Facility;
  userTravelTime: number;
};

export function getEffectiveServiceTime(facility: Facility) {
  return facility.adminOverrideTime ?? facility.medianServiceTime ?? 3;
}

export function calculateExpectedWait(waitingTokens: QueueToken[], facility: Facility) {
  return waitingTokens.length * getEffectiveServiceTime(facility);
}

export function allocateToken({ waitingTokens, servingToken, facility, userTravelTime }: AllocationInput) {
  const serviceTime = getEffectiveServiceTime(facility);
  const queueLength = waitingTokens.length;
  const expectedWaitTime = queueLength * serviceTime;
  const rawProjectedPosition =
    userTravelTime < expectedWaitTime ? queueLength + 1 : queueLength + Math.floor(userTravelTime / serviceTime);
  const projectedPosition = Math.max(1, rawProjectedPosition);
  const servingOffset = servingToken ? 1 : 0;
  const tokenNumber = projectedPosition + servingOffset;
  const peopleAhead = tokenNumber - 1;
  const estimatedCallTime = new Date(Date.now() + peopleAhead * serviceTime * 60 * 1000);

  return {
    tokenNumber,
    projectedPosition,
    peopleAhead,
    estimatedCallTime: estimatedCallTime.toISOString(),
    serviceTime,
    expectedWaitTime
  };
}

export function estimateQueueCompletionMinutes(activeUsers: number, serviceTime: number) {
  return Math.max(0, Math.round(activeUsers * serviceTime));
}

export function normalizeWaitingTokenOrder(waitingTokens: QueueToken[], servingToken?: QueueToken | null) {
  const servingOffset = servingToken ? 1 : 0;

  return waitingTokens
    .sort((a, b) => a.tokenNumber - b.tokenNumber)
    .map((token, index) => ({
      ...token,
      tokenNumber: index + 1 + servingOffset
    }));
}
