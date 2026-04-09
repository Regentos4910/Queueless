import { NextRequest, NextResponse } from "next/server";
import { buildAnalytics, db, getFacilityTokens } from "@/app/api/_lib";

export async function GET(request: NextRequest) {
  try {
    const facilityId = request.nextUrl.searchParams.get("facilityId");

    if (!facilityId) {
      return NextResponse.json({ error: "Missing facilityId." }, { status: 400 });
    }

    const [tokens, serviceLogsSnapshot] = await Promise.all([
      getFacilityTokens(facilityId),
      db().collection("serviceLogs").where("facilityId", "==", facilityId).orderBy("timestamp", "asc").get()
    ]);

    const serviceLogs = serviceLogsSnapshot.docs.map((doc) => ({
      tokenId: doc.data().tokenId as string,
      serviceTime: doc.data().serviceTime as number,
      timestamp: doc.data().timestamp as string
    }));

    return NextResponse.json(buildAnalytics(tokens, serviceLogs));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
