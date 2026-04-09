"use client";

import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import type { QueueToken } from "@/types/token";

export function useRealtimeQueue(facilityId?: string) {
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tokens"),
      where("facilityId", "==", facilityId),
      orderBy("tokenNumber", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTokens(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<QueueToken, "id">)
        }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [facilityId]);

  return { tokens, loading };
}
