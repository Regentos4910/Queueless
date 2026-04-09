import { NextRequest, NextResponse } from "next/server";
import { db, getDistanceInMeters, getFacility } from "@/app/api/_lib";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      tokenId?: string;
      userLocation?: { lat: number; lng: number };
    };

    if (!body.tokenId || !body.userLocation) {
      return NextResponse.json({ error: "Missing arrival fields." }, { status: 400 });
    }

    const tokenRef = db().collection("tokens").doc(body.tokenId);
    const tokenSnapshot = await tokenRef.get();

    if (!tokenSnapshot.exists) {
      return NextResponse.json({ error: "Token not found." }, { status: 404 });
    }

    const token = tokenSnapshot.data() as { facilityId: string };
    const facility = await getFacility(token.facilityId);
    const distance = getDistanceInMeters(body.userLocation, facility.location);

    await tokenRef.update({
      arrivalStatus: distance <= 100 ? "arrived" : "on_the_way",
      userLocation: body.userLocation
    });

    return NextResponse.json({ success: true, arrivalStatus: distance <= 100 ? "arrived" : "on_the_way", distance });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update arrival." },
      { status: 500 }
    );
  }
}
