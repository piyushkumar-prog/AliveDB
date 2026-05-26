import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/cron",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  // Bypass public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Auth is disabled — allow all traffic (local dev default)
  if (!basicAuthUser || !basicAuthPassword) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = req.cookies.get("alivedb_session");
  const expectedToken = btoa(`${basicAuthUser}:${basicAuthPassword}`);

  if (sessionCookie?.value === expectedToken) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login page
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = `?from=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.png|alivedb.png).*)",
  ],
};
