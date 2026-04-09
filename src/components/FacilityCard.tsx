import Link from "next/link";
import { MapPin, Users, TimerReset } from "lucide-react";
import type { Facility } from "@/types/facility";
import { formatMinutes } from "@/utils/time";

type Props = {
  facility: Facility;
};

export function FacilityCard({ facility }: Props) {
  return (
    <article className="panel flex h-full flex-col justify-between p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Facility</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{facility.name}</h3>
          </div>
          <div className="rounded-full bg-sky/20 px-3 py-1 text-xs font-semibold text-ink">
            Live Queue
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="panel-muted p-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              Queue size
            </div>
            <p className="mt-2 text-lg font-semibold text-ink">{facility.queueSize ?? 0} users</p>
          </div>
          <div className="panel-muted p-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TimerReset className="h-4 w-4" />
              Median service
            </div>
            <p className="mt-2 text-lg font-semibold text-ink">
              {formatMinutes(facility.adminOverrideTime ?? facility.medianServiceTime)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          Est. wait {formatMinutes(facility.waitingTime ?? 0)}
        </div>
        <Link
          href={`/queue/${facility.id}`}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Join Queue
        </Link>
      </div>
    </article>
  );
}
