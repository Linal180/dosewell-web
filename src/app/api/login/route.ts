import { cookies } from "next/headers";
import { apiOrigin, readUpstream } from "@/lib/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }
  const upstream = await readUpstream(`${apiOrigin()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!upstream.ok) {
    return Response.json(
      { error: upstream.data.error || "Could not sign in." },
      { status: upstream.status >= 400 ? upstream.status : 503 },
    );
  }
  const data = upstream.data;
  if (!data.token) {
    return Response.json({ error: "Could not sign in." }, { status: 502 });
  }

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
