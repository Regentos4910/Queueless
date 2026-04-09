import { NextRequest, NextResponse } from "next/server";
import { Timestamp, allocateToken, db, FieldValue, getFacility, getFacilityTokens, getTravelTimeInMinutes } from "@/app/api/_lib";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      facilityId?: string;
      userName?: string;
      phone?: string;
      userLocation?: { lat: number; lng: number };
    };

    if (!body.facilityId || !body.userName || !body.phone || !body.userLocation) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const facility = await getFacility(body.facilityId);
    const tokens = await getFacilityTokens(body.facilityId);
    const waitingTokens = tokens.filter((token) => token.status === "waiting");
    const servingToken = tokens.find((token) => token.status === "serving") ?? null;
    const userTravelTime = await getTravelTimeInMinutes(body.userLocation, facility.location);
    const allocation = allocateToken({
      waitingTokens,
      servingToken,
      facility,
      userTravelTime
    });

    const batch = db().batch();

    waitingTokens
      .filter((token) => token.tokenNumber >= allocation.tokenNumber)
      .forEach((token) => {
        batch.update(db().collection("tokens").doc(token.id), {
          tokenNumber: FieldValue.increment(1)
        });
      });

    const tokenRef = db().collection("tokens").doc();

    batch.set(tokenRef, {
      facilityId: body.facilityId,
      tokenNumber: allocation.tokenNumber,
      userName: body.userName,
      phone: body.phone,
      status: "waiting",
      arrivalStatus: "on_the_way",
      userLocation: body.userLocation,
      eta: userTravelTime,
      peopleAhead: allocation.peopleAhead,
      estimatedCallTime: allocation.estimatedCallTime,
      createdAt: Timestamp.now().toDate().toISOString()
    });

    await batch.commit();

    return NextResponse.json({
      tokenId: tokenRef.id,
      tokenNumber: allocation.tokenNumber,
      peopleAhead: allocation.peopleAhead,
      estimatedCallTime: allocation.estimatedCallTime
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to join queue." },
      { status: 500 }
    );
  }
}
