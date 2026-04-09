import { getRollingMedian } from "@/lib/medianService";
import { estimateQueueCompletionMinutes } from "@/lib/queueEngine";
import type { AnalyticsPayload } from "@/types/analytics";
import type { QueueToken } from "@/types/token";

type ServiceLogRecord = {
  tokenId: string;
  serviceTime: number;
  timestamp: string;
};

export function buildAnalytics(tokens: QueueToken[], serviceLogs: ServiceLogRecord[]): AnalyticsPayload {
  const serviceTimes = serviceLogs.map((log) => log.serviceTime);
  const medianServiceTime = getRollingMedian(serviceTimes);
  const waitingUsers = tokens.filter((token) => token.status === "waiting").length;
  const onTheWayUsers = tokens.filter(
    (token) => token.status === "waiting" && token.arrivalStatus !== "arrived"
  ).length;
  const arrivedUsers = tokens.filter((token) => token.arrivalStatus === "arrived").length;
  const currentlyServing = tokens.find((token) => token.status === "serving")?.tokenNumber ?? null;

  const queueLengthBuckets = new Map<string, number>();
  const servedPerHourBuckets = new Map<string, number>();

  for (const token of tokens) {
    if (!token.createdAt) {
      continue;
    }

    const date = new Date(token.createdAt);
    const bucket = `${date.getHours().toString().padStart(2, "0")}:00`;
    queueLengthBuckets.set(bucket, (queueLengthBuckets.get(bucket) ?? 0) + 1);
  }

  for (const log of serviceLogs) {
    const date = new Date(log.timestamp);
    const bucket = `${date.getHours().toString().padStart(2, "0")}:00`;
    servedPerHourBuckets.set(bucket, (servedPerHourBuckets.get(bucket) ?? 0) + 1);
  }

  return {
    queueSummary: {
      waitingUsers,
      arrivedUsers,
      onTheWayUsers,
      currentlyServing,
      estimatedQueueCompletionMinutes: estimateQueueCompletionMinutes(waitingUsers, medianServiceTime),
      medianServiceTime,
      fastestServiceTime: serviceTimes.length ? Math.min(...serviceTimes) : 0,
      slowestServiceTime: serviceTimes.length ? Math.max(...serviceTimes) : 0,
      totalServedToday: serviceLogs.length
    },
    serviceTimePerUser: serviceLogs.slice(-12).map((log, index) => ({
      label: `User ${index + 1}`,
      value: log.serviceTime
    })),
    queueLengthOverTime: Array.from(queueLengthBuckets.entries()).map(([label, value]) => ({ label, value })),
    usersServedPerHour: Array.from(servedPerHourBuckets.entries()).map(([label, value]) => ({ label, value }))
  };
}
