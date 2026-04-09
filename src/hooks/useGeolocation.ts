"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/types/facility";

type GeolocationState = {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, loading: false, error: "Geolocation is not supported in this browser." });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          loading: false,
          error: null
        });
      },
      (error) => {
        setState({ coords: null, loading: false, error: error.message });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 20000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
