import { NextRequest, NextResponse } from "next/server";
import { Timestamp, db, getFacilityTokens, renumberWaitingTokens } from "@/app/api/_lib";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { facilityId?: string };

    if (!body.facilityId) {
      return NextResponse.json({ error: "Missing facilityId." }, { status: 400 });
    }

    const tokens = await getFacilityTokens(body.facilityId);
    const existingServing = tokens.find((token) => token.status === "serving");

    if (existingServing) {
      const callTime = existingServing.callTime ? new Date(existingServing.callTime).getTime() : Date.now();
      const timedOut = Date.now() - callTime > 5 * 60 * 1000 && existingServing.arrivalStatus !== "arrived";

      if (timedOut) {
        await db().collection("tokens").doc(existingServing.id).update({
          status: "no_show",
          tokenNumber: 9999
        });
      } else {
        return NextResponse.json({ error: "A token is already being served." }, { status: 409 });
      }
    }

    const nextToken = tokens.filter((token) => token.status === "waiting").sort((a, b) => a.tokenNumber - b.tokenNumber)[0];

    if (!nextToken) {
      return NextResponse.json({ error: "No waiting tokens available." }, { status: 404 });
    }

    await db().collection("tokens").doc(nextToken.id).update({
      status: "serving",
      callTime: Timestamp.now().toDate().toISOString()
    });

    await renumberWaitingTokens(body.facilityId);

    return NextResponse.json({ success: true, tokenId: nextToken.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to call next user." },
      { status: 500 }
    );
  }
}
