async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function joinQueue(payload: {
  facilityId: string;
  userName: string;
  phone: string;
  userLocation: { lat: number; lng: number };
}) {
  const response = await fetch("/api/joinQueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to join queue."));
  }

  return (await response.json()) as {
    tokenId: string;
    tokenNumber: number;
    estimatedCallTime: string;
    peopleAhead: number;
  };
}

export async function callNext(facilityId: string) {
  const response = await fetch("/api/callNext", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ facilityId })
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to call next user."));
  }

  return response.json();
}

export async function completeToken(tokenId: string) {
  const response = await fetch("/api/completeToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokenId })
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to complete token."));
  }

  return response.json();
}

export async function rearrangeToken(payload: { facilityId: string; tokenId: string; toIndex: number }) {
  const response = await fetch("/api/rearrangeToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to rearrange token."));
  }

  return response.json();
}

export async function updateTokenStatus(payload: {
  tokenId: string;
  status?: "waiting" | "serving" | "completed" | "no_show";
  arrivalStatus?: "on_the_way" | "arrived" | "unknown";
}) {
  const response = await fetch("/api/updateTokenStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to update token status."));
  }

  return response.json();
}

export async function updateArrival(payload: {
  tokenId: string;
  userLocation: { lat: number; lng: number };
}) {
  const response = await fetch("/api/updateArrival", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to update arrival."));
  }

  return response.json();
}

export async function overrideServiceTime(facilityId: string, adminOverrideTime: number | null) {
  const response = await fetch("/api/overrideServiceTime", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ facilityId, adminOverrideTime })
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to override service time."));
  }

  return response.json();
}
