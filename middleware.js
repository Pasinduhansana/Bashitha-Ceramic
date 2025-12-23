import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Paths that require authentication
const PROTECTED_PATHS = ["/dashboard"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
