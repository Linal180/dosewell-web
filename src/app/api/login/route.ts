import { cookies } from "next/headers";
import { apiOrigin } from "@/lib/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  const upstream = await fetch(`${apiOrigin()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await upstream.json();
  if (!upstream.ok) return Response.json(data, { status: upstream.status });

  const secure = request.headers.get("x-forwarded-proto") === "https";
  (await cookies()).set("dosewell_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return Response.json({ user: data.user });
}
