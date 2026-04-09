import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
};

export function StatsCard({ label, value, hint, icon }: Props) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">{icon}</div> : null}
      </div>
    </div>
  );
}
