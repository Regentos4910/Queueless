import Link from "next/link";
import { ArrowRight, ChartColumnBig, MapPinned, ShieldCheck } from "lucide-react";

const highlights = [
  {
    title: "Just-in-time arrivals",
    description: "Tokens are allocated using median service time, queue load, and live travel ETA."
  },
  {
    title: "Realtime admin control",
    description: "Call next, skip no-shows, override service time, and reshuffle tokens instantly."
  },
  {
    title: "Operational analytics",
    description: "Track throughput, queue completion, and service-time trends from a single dashboard."
  }
];

export default function HomePage() {
  return (
    <main className="bg-hero-grid">
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
            QueueLess for Smart Facilities
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-ink sm:text-6xl">
            Build queues that move people, not crowds.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            QueueLess gives users remote digital tokens while admins keep full control over arrival timing,
            service pacing, and queue fairness.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Find a Queue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/login?redirectTo=/admin"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Open Admin Dashboard
            </Link>
          </div>
        </div>
        <div className="panel grid gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-ink p-5 text-white">
              <MapPinned className="h-6 w-6 text-sky" />
              <p className="mt-4 text-sm text-white/70">Geolocation Aware</p>
              <p className="mt-2 text-2xl font-semibold">Arrival detection within 100 meters</p>
            </div>
            <div className="rounded-3xl bg-sand p-5">
              <ChartColumnBig className="h-6 w-6 text-coral" />
              <p className="mt-4 text-sm text-slate-500">Predictive Analytics</p>
              <p className="mt-2 text-2xl font-semibold text-ink">Median-based ETA that avoids outliers</p>
            </div>
          </div>
          <div className="rounded-3xl border border-sky/50 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Queue status snapshot
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <h2 className="text-base font-semibold text-ink">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
