"use client";

import { useMemo, useState } from "react";
import { FacilityCard } from "@/components/FacilityCard";
import { useFacilities } from "@/hooks/useFacilities";
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue";
import { enrichFacilities } from "@/services/facilityService";

export default function SearchPage() {
  const { facilities, loading } = useFacilities();
  const [query, setQuery] = useState("");

  const waitingCounts = useMemo(() => {
    const counts = new Map<string, number>();

    facilities.forEach((facility) => {
      counts.set(facility.id, 0);
    });

    return counts;
  }, [facilities]);

  facilities.forEach((facility) => {
    useRealtimeQueue(facility.id);
  });

  const filtered = useMemo(() => {
    const enriched = enrichFacilities(facilities, waitingCounts);

    return enriched.filter((facility) => facility.name.toLowerCase().includes(query.toLowerCase()));
  }, [facilities, query, waitingCounts]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">User Search</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Find a queue by facility name</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Search hospitals, banks, service counters, or offices and request a smart token that considers live queue
          pressure and your travel time.
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search facilities"
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-ink"
        />
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!loading && filtered.length === 0 ? (
          <div className="panel col-span-full p-8 text-center text-slate-500">No facilities matched your search.</div>
        ) : null}
        {filtered.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </section>
    </main>
  );
}
