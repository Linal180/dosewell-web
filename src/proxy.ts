import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicOrigin } from "@/lib/public-origin";

const knownPaths = [
  /^\/$/,
  /^\/login$/,
  /^\/patients$/,
  /^\/patients\/[^/]+$/,
  /^\/prescribe$/,
  /^\/audit$/,
  /^\/doses$/,
  /^\/adherence$/,
];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  if (!knownPaths.some((pattern) => pattern.test(path))) return NextResponse.next();

  const token = request.cookies.get("dosewell_token")?.value;
  const loggingIn = path === "/login";
  const origin = publicOrigin(request);

  if (!token && !loggingIn) return NextResponse.redirect(new URL("/login", origin));
  if (token && loggingIn) return NextResponse.redirect(new URL("/", origin));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon.svg).*)"],
};
