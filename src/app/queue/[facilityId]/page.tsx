"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import { joinQueue } from "@/services/queueService";
import type { Facility } from "@/types/facility";
import { formatMinutes } from "@/utils/time";

export default function JoinQueuePage() {
  const params = useParams();
  const facilityId = Array.isArray(params.facilityId) ? params.facilityId[0] : params.facilityId;
  const router = useRouter();
  const { coords, error: geolocationError, loading: locationLoading } = useGeolocation();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) {
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "facilities", facilityId), (snapshot) => {
      if (!snapshot.exists()) {
        setFacility(null);
        return;
      }

      setFacility({ id: snapshot.id, ...(snapshot.data() as Omit<Facility, "id">) });
    });

    return unsubscribe;
  }, [facilityId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!facilityId) {
      setError("This facility could not be resolved.");
      return;
    }

    if (!coords) {
      setError("Enable location access to request a smart queue token.");
      return;
    }

    setBusy(true);

    try {
      const response = await joinQueue({
        facilityId,
        userName: name,
        phone,
        userLocation: coords
      });

      router.push(`/token/${response.tokenId}`);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Failed to request a queue token.");
    } finally {
      setBusy(false);
    }
  }

  const effectiveServiceTime = facility ? facility.adminOverrideTime ?? facility.medianServiceTime : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Join Queue</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">{facility?.name ?? "Loading facility..."}</h1>
          <p className="mt-3 text-slate-600">
            Your token is assigned using the live queue, service-time median, and your travel ETA so you arrive close
            to your turn instead of waiting on-site.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-slate-600">
                Name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-slate-600">
                Phone
              </label>
              <input
                id="phone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
              />
            </div>
            <button
              type="submit"
              disabled={busy || locationLoading}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Assigning Token..." : "Request Smart Token"}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {geolocationError ? <p className="text-sm text-amber-700">{geolocationError}</p> : null}
          </form>
        </div>
        <aside className="grid gap-4">
          <div className="panel p-5">
            <p className="text-sm text-slate-500">Estimated service pace</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{formatMinutes(effectiveServiceTime)}</p>
            <p className="mt-2 text-sm text-slate-500">Admin overrides are applied automatically when active.</p>
          </div>
          <div className="panel p-5">
            <p className="text-sm text-slate-500">Location status</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Waiting for geolocation permission"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              QueueLess uses your location to estimate ETA and later confirm arrival within the facility geofence.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
