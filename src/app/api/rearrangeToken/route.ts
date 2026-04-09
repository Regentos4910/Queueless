import { NextRequest, NextResponse } from "next/server";
import { db, getFacilityTokens } from "@/app/api/_lib";
import { clampIndex } from "@/utils/tokenGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      facilityId?: string;
      tokenId?: string;
      toIndex?: number;
    };

    if (!body.facilityId || !body.tokenId || typeof body.toIndex !== "number") {
      return NextResponse.json({ error: "Missing rearrangement fields." }, { status: 400 });
    }

    const tokens = await getFacilityTokens(body.facilityId);
    const servingToken = tokens.find((token) => token.status === "serving") ?? null;
    const waitingTokens = tokens.filter((token) => token.status === "waiting").sort((a, b) => a.tokenNumber - b.tokenNumber);
    const currentIndex = waitingTokens.findIndex((token) => token.id === body.tokenId);

    if (currentIndex < 0) {
      return NextResponse.json({ error: "Token not found in waiting queue." }, { status: 404 });
    }

    const targetIndex = clampIndex(body.toIndex, 0, waitingTokens.length - 1);
    const [movedToken] = waitingTokens.splice(currentIndex, 1);
    waitingTokens.splice(targetIndex, 0, movedToken);

    const servingOffset = servingToken ? 1 : 0;
    const batch = db().batch();

    waitingTokens.forEach((token, index) => {
      batch.update(db().collection("tokens").doc(token.id), {
        tokenNumber: index + 1 + servingOffset
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to rearrange token." },
      { status: 500 }
    );
  }
}
