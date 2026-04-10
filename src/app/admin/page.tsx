"use client";

import { BarChart3, Clock3, ListOrdered, LogOut, MapPinned, Search, Timer } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QueueTable } from "@/components/QueueTable";
import { QueueLengthChart } from "@/components/charts/QueueLengthChart";
import { ServiceTimeChart } from "@/components/charts/ServiceTimeChart";
import { ThroughputChart } from "@/components/charts/ThroughputChart";
import { StatsCard } from "@/components/StatsCard";
import { useFacilities } from "@/hooks/useFacilities";
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue";
import { fetchAnalytics } from "@/services/analyticsService";
import { createFacility, searchPlaces } from "@/services/facilityService";
import {
  callNext,
  completeToken,
  overrideServiceTime,
  rearrangeToken,
  updateTokenStatus
} from "@/services/queueService";
import type { AnalyticsPayload } from "@/types/analytics";
import { formatMinutes } from "@/utils/time";

const emptyAnalytics: AnalyticsPayload = {
  queueSummary: {
    waitingUsers: 0,
    arrivedUsers: 0,
    onTheWayUsers: 0,
    currentlyServing: null,
    estimatedQueueCompletionMinutes: 0,
    medianServiceTime: 3,
    fastestServiceTime: 0,
    slowestServiceTime: 0,
    totalServedToday: 0
  },
  serviceTimePerUser: [],
  queueLengthOverTime: [],
  usersServedPerHour: []
};

export default function AdminPage() {
  const router = useRouter();
  const { facilities } = useFacilities();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const { tokens } = useRealtimeQueue(selectedFacilityId);
  const [analytics, setAnalytics] = useState<AnalyticsPayload>(emptyAnalytics);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState("");
  const [facilityMessage, setFacilityMessage] = useState<string | null>(null);
  const [facilityError, setFacilityError] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<
    Array<{ name: string; address: string; lat: number; lng: number; mapsUrl: string }>
  >([]);
  const [createForm, setCreateForm] = useState({
    name: "",
    lat: "",
    lng: "",
    medianServiceTime: "3"
  });

  useEffect(() => {
    if (!selectedFacilityId && facilities[0]) {
      setSelectedFacilityId(facilities[0].id);
    }
  }, [facilities, selectedFacilityId]);

  useEffect(() => {
    if (!selectedFacilityId) {
      setAnalytics(emptyAnalytics);
      return;
    }

    void fetchAnalytics(selectedFacilityId).then(setAnalytics).catch(() => setAnalytics(emptyAnalytics));
  }, [selectedFacilityId, tokens]);

  const selectedFacility = useMemo(
    () => facilities.find((facility) => facility.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId]
  );

  async function handleCallNext() {
    if (!selectedFacilityId) {
      return;
    }

    setBusyAction("call-next");
    await callNext(selectedFacilityId);
    setBusyAction(null);
  }

  async function handleMove(tokenId: string, direction: "up" | "down") {
    const sorted = [...tokens].filter((token) => token.status === "waiting").sort((a, b) => a.tokenNumber - b.tokenNumber);
    const index = sorted.findIndex((token) => token.id === tokenId);

    if (index < 0) {
      return;
    }

    const toIndex = direction === "up" ? index - 1 : index + 1;
    if (toIndex < 0 || toIndex >= sorted.length) {
      return;
    }

    setBusyAction(`move-${tokenId}`);
    await rearrangeToken({ facilityId: selectedFacilityId, tokenId, toIndex });
    setBusyAction(null);
  }

  async function handleComplete(tokenId: string) {
    setBusyAction(`complete-${tokenId}`);
    await completeToken(tokenId);
    setBusyAction(null);
  }

  async function handleNoShow(tokenId: string) {
    setBusyAction(`noshow-${tokenId}`);
    await updateTokenStatus({ tokenId, status: "no_show" });
    setBusyAction(null);
  }

  async function handleOverrideSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFacilityId) {
      return;
    }

    setBusyAction("override");
    await overrideServiceTime(selectedFacilityId, overrideValue ? Number(overrideValue) : null);
    setBusyAction(null);
    setOverrideValue("");
  }

  async function handleCreateFacility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFacilityError(null);
    setFacilityMessage(null);
    setBusyAction("create-facility");

    try {
      const result = await createFacility({
        name: createForm.name,
        lat: Number(createForm.lat),
        lng: Number(createForm.lng),
        medianServiceTime: Number(createForm.medianServiceTime)
      });

      setSelectedFacilityId(result.facilityId);
      setFacilityMessage("Facility created successfully. It should appear in the selector as Firestore syncs.");
      setCreateForm({ name: "", lat: "", lng: "", medianServiceTime: "3" });
      setPlaceQuery("");
      setPlaceResults([]);
    } catch (error) {
      setFacilityError(
        error instanceof Error
          ? error.message
          : "Facility creation failed. Check Firebase Admin credentials and Firestore access."
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePlaceSearch() {
    setFacilityError(null);
    setFacilityMessage(null);
    setBusyAction("search-place");

    try {
      const response = await searchPlaces(placeQuery);
      setPlaceResults(response.results);
      if (!response.results.length) {
        setFacilityMessage("No places matched that search. Try a more specific facility name or city.");
      }
    } catch (error) {
      setFacilityError(error instanceof Error ? error.message : "Unable to search places.");
      setPlaceResults([]);
    } finally {
      setBusyAction(null);
    }
  }

  function handleSelectPlace(result: { name: string; address: string; lat: number; lng: number; mapsUrl: string }) {
    setCreateForm((current) => ({
      ...current,
      name: result.name,
      lat: result.lat.toString(),
      lng: result.lng.toString()
    }));
    setFacilityMessage(`Picked ${result.name}. Coordinates are now filled from Google Maps search.`);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Admin Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">Run the queue like a control tower</h1>
            <p className="mt-3 text-slate-600">
              Track live service pace, override timings, rearrange users, and keep the queue moving even when no-shows
              happen.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
            <select
              value={selectedFacilityId}
              onChange={(event) => setSelectedFacilityId(event.target.value)}
              className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-ink"
            >
              <option value="">Select a facility</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleCreateFacility} className="panel space-y-4 p-6">
            <div>
              <p className="text-lg font-semibold text-ink">Create Facility</p>
              <p className="text-sm text-slate-500">
                Search the place first, pick the correct Google Maps result, then create the facility.
              </p>
            </div>
            <div className="space-y-3">
              <label htmlFor="placeQuery" className="text-sm font-medium text-slate-600">
                Search facility on Google Maps
              </label>
              <div className="flex gap-3">
                <input
                  id="placeQuery"
                  placeholder="Example: Ruby Hall Clinic Pune"
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={() => void handlePlaceSearch()}
                  disabled={busyAction === "search-place" || !placeQuery.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />
                  {busyAction === "search-place" ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
            {placeResults.length ? (
              <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
                {placeResults.map((result) => (
                  <div
                    key={`${result.name}-${result.address}`}
                    className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <button type="button" onClick={() => handleSelectPlace(result)} className="flex-1 text-left">
                      <p className="font-semibold text-ink">{result.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{result.address}</p>
                    </button>
                    <a
                      href={result.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <MapPinned className="h-4 w-4 text-coral" />
                      Open Map
                    </a>
                  </div>
                ))}
              </div>
            ) : null}
            <input
              placeholder="Facility name"
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Latitude"
                value={createForm.lat}
                onChange={(event) => setCreateForm((current) => ({ ...current, lat: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
              />
              <input
                placeholder="Longitude"
                value={createForm.lng}
                onChange={(event) => setCreateForm((current) => ({ ...current, lng: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
              />
            </div>
            <input
              placeholder="Median service time (minutes)"
              value={createForm.medianServiceTime}
              onChange={(event) => setCreateForm((current) => ({ ...current, medianServiceTime: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
            />
            {facilityMessage ? <p className="text-sm text-emerald-700">{facilityMessage}</p> : null}
            {facilityError ? <p className="text-sm text-red-600">{facilityError}</p> : null}
            <p className="text-xs text-slate-500">
              
            </p>
            <button
              type="submit"
              disabled={busyAction === "create-facility" || !createForm.name || !createForm.lat || !createForm.lng}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busyAction === "create-facility" ? "Creating..." : "Create Facility"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Now Serving"
              value={analytics.queueSummary.currentlyServing ? `#${analytics.queueSummary.currentlyServing}` : "--"}
              hint="Active serving token"
              icon={<ListOrdered className="h-5 w-5" />}
            />
            <StatsCard
              label="Users Left"
              value={analytics.queueSummary.waitingUsers}
              hint={`${analytics.queueSummary.arrivedUsers} arrived`}
              icon={<Clock3 className="h-5 w-5" />}
            />
            <StatsCard
              label="Queue End ETA"
              value={formatMinutes(analytics.queueSummary.estimatedQueueCompletionMinutes)}
              hint={`${analytics.queueSummary.onTheWayUsers} on the way`}
              icon={<Timer className="h-5 w-5" />}
            />
            <StatsCard
              label="Median Service"
              value={formatMinutes(analytics.queueSummary.medianServiceTime)}
              hint={`${analytics.queueSummary.totalServedToday} served today`}
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </section>

          <form onSubmit={handleOverrideSubmit} className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">Admin override service time</p>
              <p className="mt-1 text-sm text-slate-500">
                Current effective time: {selectedFacility ? formatMinutes(selectedFacility.adminOverrideTime ?? selectedFacility.medianServiceTime) : "--"}
              </p>
              <input
                value={overrideValue}
                onChange={(event) => setOverrideValue(event.target.value)}
                placeholder="Minutes, leave blank to clear override"
                className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedFacilityId || busyAction === "override"}
              className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busyAction === "override" ? "Saving..." : "Apply Override"}
            </button>
          </form>

          <QueueTable
            tokens={tokens.filter((token) => token.status !== "completed")}
            onMove={handleMove}
            onCallNext={handleCallNext}
            onComplete={handleComplete}
            onNoShow={handleNoShow}
            busyAction={busyAction}
          />

          <section className="grid gap-6 lg:grid-cols-2">
            <ServiceTimeChart dataPoints={analytics.serviceTimePerUser} />
            <QueueLengthChart dataPoints={analytics.queueLengthOverTime} />
          </section>
          <ThroughputChart dataPoints={analytics.usersServedPerHour} />
        </div>
      </section>
    </main>
  );
}
