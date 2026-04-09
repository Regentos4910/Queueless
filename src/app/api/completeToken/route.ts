import { NextRequest, NextResponse } from "next/server";
import { Timestamp, db, getFacility, getRollingMedian, getFacilityTokens, renumberWaitingTokens } from "@/app/api/_lib";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { tokenId?: string };

    if (!body.tokenId) {
      return NextResponse.json({ error: "Missing tokenId." }, { status: 400 });
    }

    const tokenRef = db().collection("tokens").doc(body.tokenId);
    const tokenSnapshot = await tokenRef.get();

    if (!tokenSnapshot.exists) {
      return NextResponse.json({ error: "Token not found." }, { status: 404 });
    }

    const token = tokenSnapshot.data() as {
      facilityId: string;
      callTime?: string;
    };

    const completionTime = Timestamp.now().toDate();
    const callTime = token.callTime ? new Date(token.callTime) : completionTime;
    const serviceTime = Math.max(1, Math.round((completionTime.getTime() - callTime.getTime()) / 60000));

    await tokenRef.update({
      status: "completed",
      completionTime: completionTime.toISOString(),
      serviceTime
    });

    await db().collection("serviceLogs").add({
      facilityId: token.facilityId,
      tokenId: body.tokenId,
      serviceTime,
      timestamp: completionTime.toISOString()
    });

    const logs = await db()
      .collection("serviceLogs")
      .where("facilityId", "==", token.facilityId)
      .orderBy("timestamp", "asc")
      .limitToLast(20)
      .get();

    const medianServiceTime = getRollingMedian(logs.docs.map((doc) => (doc.data().serviceTime as number) ?? 3));

    await db().collection("facilities").doc(token.facilityId).update({
      medianServiceTime
    });

    await renumberWaitingTokens(token.facilityId);

    return NextResponse.json({ success: true, serviceTime });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete token." },
      { status: 500 }
    );
  }
}
