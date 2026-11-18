import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { publicOrigin } from "@/lib/public-origin";

export async function POST(request: Request) {
  (await cookies()).delete("dosewell_token");
  return NextResponse.redirect(new URL("/login", publicOrigin(request)), 303);
}
