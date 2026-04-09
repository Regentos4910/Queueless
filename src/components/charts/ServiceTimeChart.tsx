"use client";

import "@/components/charts/ChartShell";
import { Bar } from "react-chartjs-2";
import type { ServiceLogPoint } from "@/types/analytics";

type Props = {
  dataPoints: ServiceLogPoint[];
};

export function ServiceTimeChart({ dataPoints }: Props) {
  return (
    <div className="panel p-5">
      <h3 className="text-lg font-semibold text-ink">Service Time Per User</h3>
      <div className="mt-4 h-72">
        <Bar
          data={{
            labels: dataPoints.map((point) => point.label),
            datasets: [
              {
                label: "Minutes",
                data: dataPoints.map((point) => point.value),
                borderRadius: 10,
                backgroundColor: "#8dd7cf"
              }
            ]
          }}
          options={{ maintainAspectRatio: false, responsive: true }}
        />
      </div>
    </div>
  );
}
