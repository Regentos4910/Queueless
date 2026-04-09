"use client";

import "@/components/charts/ChartShell";
import { Bar } from "react-chartjs-2";
import type { QueueSnapshotPoint } from "@/types/analytics";

type Props = {
  dataPoints: QueueSnapshotPoint[];
};

export function ThroughputChart({ dataPoints }: Props) {
  return (
    <div className="panel p-5">
      <h3 className="text-lg font-semibold text-ink">Users Served Per Hour</h3>
      <div className="mt-4 h-72">
        <Bar
          data={{
            labels: dataPoints.map((point) => point.label),
            datasets: [
              {
                label: "Served",
                data: dataPoints.map((point) => point.value),
                borderRadius: 10,
                backgroundColor: "#10212b"
              }
            ]
          }}
          options={{ maintainAspectRatio: false, responsive: true }}
        />
      </div>
    </div>
  );
}
