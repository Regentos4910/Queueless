"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import type { QueueToken } from "@/types/token";

export function useAllTokens() {
  const [tokens, setTokens] = useState<QueueToken[]>([]);

  useEffect(() => {
    const q = query(collection(db, "tokens"), orderBy("tokenNumber", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTokens(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<QueueToken, "id">) })));
    });

    return unsubscribe;
  }, []);

  return { tokens };
}
