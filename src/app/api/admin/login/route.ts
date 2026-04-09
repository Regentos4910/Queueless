import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSessionValue } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: "Admin credentials are not configured on the server." },
        { status: 500 }
      );
    }

    if (body.username !== expectedUsername || body.password !== expectedPassword) {
      return NextResponse.json({ error: "Incorrect admin credentials." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to log in." },
      { status: 500 }
    );
  }
}
