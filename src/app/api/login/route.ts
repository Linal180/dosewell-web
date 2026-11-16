import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const upstream = await fetch(`${process.env.API_URL}/api/v1/auth/login`, {
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
