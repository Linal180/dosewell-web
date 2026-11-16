import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("dosewell_token")?.value;
  const loggingIn = request.nextUrl.pathname === "/login";

  if (!token && !loggingIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && loggingIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon.svg).*)"],
};
