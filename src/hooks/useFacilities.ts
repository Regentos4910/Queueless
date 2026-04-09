"use client";

import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import type { Facility } from "@/types/facility";

export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "facilities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFacilities(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Facility, "id">)
        }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { facilities, loading };
}
