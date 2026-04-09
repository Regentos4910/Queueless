"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TokenDisplay } from "@/components/TokenDisplay";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue";
import { useTokenStatus } from "@/hooks/useTokenStatus";
import { db } from "@/lib/firebase/client";
import { getDistanceInMeters } from "@/lib/geolocation";
import { updateArrival } from "@/services/queueService";
import type { Facility } from "@/types/facility";

export default function TokenStatusPage() {
  const params = useParams();
  const tokenId = Array.isArray(params.tokenId) ? params.tokenId[0] : params.tokenId;
  const { token, loading } = useTokenStatus(tokenId);
  const { coords } = useGeolocation();
  const [facility, setFacility] = useState<Facility | null>(null);
  const { tokens } = useRealtimeQueue(token?.facilityId);

  useEffect(() => {
    if (!token?.facilityId) {
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "facilities", token.facilityId), (snapshot) => {
      if (!snapshot.exists()) {
        setFacility(null);
        return;
      }

      setFacility({ id: snapshot.id, ...(snapshot.data() as Omit<Facility, "id">) });
    });

    return unsubscribe;
  }, [token?.facilityId]);

  useEffect(() => {
    if (!token || !coords || !facility) {
      return;
    }

    const distance = getDistanceInMeters(coords, facility.location);

    if (distance <= 100 && token.arrivalStatus !== "arrived") {
      void updateArrival({ tokenId: token.id, userLocation: coords });
    }
  }, [coords, facility, token]);

  const peopleAhead = useMemo(() => {
    if (!token) {
      return 0;
    }

    return tokens.filter(
      (queueToken) =>
        (queueToken.status === "waiting" || queueToken.status === "serving") && queueToken.tokenNumber < token.tokenNumber
    ).length;
  }, [token, tokens]);

  const progress = useMemo(() => {
    if (!token) {
      return 0;
    }

    const activeCount = tokens.filter((queueToken) => queueToken.status === "waiting" || queueToken.status === "serving").length;

    if (activeCount === 0) {
      return 100;
    }

    return Math.max(5, Math.round(((activeCount - peopleAhead) / activeCount) * 100));
  }, [peopleAhead, token, tokens]);

  if (loading || !token) {
    return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">Loading token...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <TokenDisplay token={token} peopleAhead={peopleAhead} />
      <section className="panel mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Queue Progress</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Stay ready for your turn</h2>
          </div>
          <p className="text-2xl font-semibold text-ink">{progress}%</p>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Arrival updates are detected automatically when you are within 100 meters of the facility.
        </p>
      </section>
    </main>
  );
}
