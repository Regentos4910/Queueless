import { NextRequest, NextResponse } from "next/server";
import { Timestamp, db } from "@/app/api/_lib";

export async function GET() {
  try {
    const snapshot = await db().collection("facilities").get();

    return NextResponse.json(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch facilities." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      lat?: number;
      lng?: number;
      medianServiceTime?: number;
    };

    if (!body.name || typeof body.lat !== "number" || typeof body.lng !== "number") {
      return NextResponse.json({ error: "Missing facility fields." }, { status: 400 });
    }

    const ref = await db().collection("facilities").add({
      name: body.name,
      location: { lat: body.lat, lng: body.lng },
      medianServiceTime: body.medianServiceTime ?? 3,
      adminOverrideTime: null,
      createdAt: Timestamp.now().toDate().toISOString()
    });

    return NextResponse.json({ facilityId: ref.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create facility." },
      { status: 500 }
    );
  }
}
