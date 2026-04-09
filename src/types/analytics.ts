export type QueueSnapshotPoint = {
  label: string;
  value: number;
};

export type ServiceLogPoint = {
  label: string;
  value: number;
};

export type AnalyticsPayload = {
  queueSummary: {
    waitingUsers: number;
    arrivedUsers: number;
    onTheWayUsers: number;
    currentlyServing?: number | null;
    estimatedQueueCompletionMinutes: number;
    medianServiceTime: number;
    fastestServiceTime: number;
    slowestServiceTime: number;
    totalServedToday: number;
  };
  serviceTimePerUser: ServiceLogPoint[];
  queueLengthOverTime: QueueSnapshotPoint[];
  usersServedPerHour: QueueSnapshotPoint[];
};
