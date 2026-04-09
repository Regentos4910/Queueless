import { NextRequest, NextResponse } from "next/server";
import { db, renumberWaitingTokens } from "@/app/api/_lib";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      tokenId?: string;
      status?: "waiting" | "serving" | "completed" | "no_show";
      arrivalStatus?: "on_the_way" | "arrived" | "unknown";
    };

    if (!body.tokenId) {
      return NextResponse.json({ error: "Missing tokenId." }, { status: 400 });
    }

    const tokenRef = db().collection("tokens").doc(body.tokenId);
    const snapshot = await tokenRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Token not found." }, { status: 404 });
    }

    const token = snapshot.data() as { facilityId: string };
    const payload: Record<string, unknown> = {};

    if (body.status) {
      payload.status = body.status;
      if (body.status === "no_show") {
        payload.tokenNumber = 9999;
      }
    }

    if (body.arrivalStatus) {
      payload.arrivalStatus = body.arrivalStatus;
    }

    await tokenRef.update(payload);
    await renumberWaitingTokens(token.facilityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update token status." },
      { status: 500 }
    );
  }
}
