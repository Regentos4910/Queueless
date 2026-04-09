import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/api/_lib";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      facilityId?: string;
      adminOverrideTime?: number | null;
    };

    if (!body.facilityId) {
      return NextResponse.json({ error: "Missing facilityId." }, { status: 400 });
    }

    await db().collection("facilities").doc(body.facilityId).update({
      adminOverrideTime: body.adminOverrideTime ?? null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to override service time." },
      { status: 500 }
    );
  }
}
