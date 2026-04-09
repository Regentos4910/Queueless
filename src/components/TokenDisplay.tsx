import type { QueueToken } from "@/types/token";
import { formatDateTime } from "@/utils/time";

type Props = {
  token: QueueToken;
  peopleAhead: number;
};

export function TokenDisplay({ token, peopleAhead }: Props) {
  return (
    <section className="panel p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Queue Token</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-ink p-5 text-white">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">Token Number</p>
          <p className="mt-3 text-6xl font-semibold">{token.tokenNumber}</p>
        </div>
        <div className="grid gap-4">
          <div className="panel-muted p-4">
            <p className="text-sm text-slate-500">People Ahead</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{peopleAhead}</p>
          </div>
          <div className="panel-muted p-4">
            <p className="text-sm text-slate-500">Estimated Call Time</p>
            <p className="mt-2 text-lg font-semibold text-ink">{formatDateTime(token.estimatedCallTime)}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="panel-muted p-4">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 text-lg font-semibold capitalize text-ink">{token.status.replace("_", " ")}</p>
        </div>
        <div className="panel-muted p-4">
          <p className="text-sm text-slate-500">Arrival</p>
          <p className="mt-2 text-lg font-semibold capitalize text-ink">{token.arrivalStatus.replace("_", " ")}</p>
        </div>
        <div className="panel-muted p-4">
          <p className="text-sm text-slate-500">ETA</p>
          <p className="mt-2 text-lg font-semibold text-ink">{token.eta ? `${token.eta} min` : "--"}</p>
        </div>
      </div>
    </section>
  );
}
