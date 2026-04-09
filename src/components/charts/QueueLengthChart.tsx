"use client";

import "@/components/charts/ChartShell";
import { Line } from "react-chartjs-2";
import type { QueueSnapshotPoint } from "@/types/analytics";

type Props = {
  dataPoints: QueueSnapshotPoint[];
};

export function QueueLengthChart({ dataPoints }: Props) {
  return (
    <div className="panel p-5">
      <h3 className="text-lg font-semibold text-ink">Queue Length Over Time</h3>
      <div className="mt-4 h-72">
        <Line
          data={{
            labels: dataPoints.map((point) => point.label),
            datasets: [
              {
                label: "Users",
                data: dataPoints.map((point) => point.value),
                borderColor: "#ff8d6c",
                backgroundColor: "rgba(255,141,108,0.2)",
                fill: true,
                tension: 0.35
              }
            ]
          }}
          options={{ maintainAspectRatio: false, responsive: true }}
        />
      </div>
    </div>
  );
}
