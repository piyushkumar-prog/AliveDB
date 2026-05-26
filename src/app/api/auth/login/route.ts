import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!basicAuthUser || !basicAuthPassword) {
    // Auth not configured — return success (open mode)
    return NextResponse.json({ success: true });
  }

  if (username !== basicAuthUser || password !== basicAuthPassword) {
    return NextResponse.json(
      { success: false, message: "Invalid username or password." },
      { status: 401 }
    );
  }

  const sessionToken = btoa(`${basicAuthUser}:${basicAuthPassword}`);

  const response = NextResponse.json({ success: true });
  response.cookies.set("alivedb_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // 30 days
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
