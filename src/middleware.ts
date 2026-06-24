import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/auth")
  );
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/profile", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Sign in required to use this app." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
