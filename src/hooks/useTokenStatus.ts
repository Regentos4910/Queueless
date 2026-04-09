"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import type { QueueToken } from "@/types/token";

export function useTokenStatus(tokenId?: string) {
  const [token, setToken] = useState<QueueToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "tokens", tokenId), (snapshot) => {
      if (!snapshot.exists()) {
        setToken(null);
        setLoading(false);
        return;
      }

      setToken({ id: snapshot.id, ...(snapshot.data() as Omit<QueueToken, "id">) });
      setLoading(false);
    });

    return unsubscribe;
  }, [tokenId]);

  return { token, loading };
}
