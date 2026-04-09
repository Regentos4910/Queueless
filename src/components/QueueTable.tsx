"use client";

import type { QueueToken } from "@/types/token";
import { formatDateTime } from "@/utils/time";

type Props = {
  tokens: QueueToken[];
  onMove: (tokenId: string, direction: "up" | "down") => void;
  onCallNext: () => void;
  onComplete: (tokenId: string) => void;
  onNoShow: (tokenId: string) => void;
  busyAction?: string | null;
};

export function QueueTable({ tokens, onMove, onCallNext, onComplete, onNoShow, busyAction }: Props) {
  const sorted = [...tokens].sort((a, b) => a.tokenNumber - b.tokenNumber);

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">Queue Control</h3>
          <p className="text-sm text-slate-500">Reorder, call, skip, and complete tokens in realtime.</p>
        </div>
        <button
          type="button"
          onClick={onCallNext}
          disabled={busyAction === "call-next"}
          className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busyAction === "call-next" ? "Calling..." : "Call Next User"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Token</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Arrival</th>
              <th className="px-5 py-3 font-medium">ETA</th>
              <th className="px-5 py-3 font-medium">Call Time</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sorted.map((token, index) => (
              <tr key={token.id}>
                <td className="px-5 py-4 font-semibold text-ink">#{token.tokenNumber}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{token.userName}</p>
                  {token.phone ? <p className="text-xs text-slate-500">{token.phone}</p> : null}
                </td>
                <td className="px-5 py-4 capitalize text-slate-600">{token.status.replace("_", " ")}</td>
                <td className="px-5 py-4 capitalize text-slate-600">{token.arrivalStatus.replace("_", " ")}</td>
                <td className="px-5 py-4 text-slate-600">{token.eta ? `${token.eta} min` : "--"}</td>
                <td className="px-5 py-4 text-slate-600">{formatDateTime(token.callTime)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onMove(token.id, "up")}
                      disabled={index === 0}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(token.id, "down")}
                      disabled={index === sorted.length - 1}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => onComplete(token.id)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => onNoShow(token.id)}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                    >
                      No Show
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
