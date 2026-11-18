import { cookies } from "next/headers";
import { apiOrigin, readUpstream, wakingMessage } from "@/lib/api";

async function forward(request: Request, path: string[]) {
  const token = (await cookies()).get("dosewell_token")?.value;
  const url = new URL(request.url);
  const headers = new Headers({ Accept: "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.set("Content-Type", "application/json");
  }

  const upstream = await readUpstream(
    `${apiOrigin()}/api/v1/${path.join("/")}${url.search}`,
    {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    },
    4,
  );
  if (!upstream.text) {
    return Response.json(
      { error: upstream.data.error || wakingMessage },
      { status: upstream.status >= 400 ? upstream.status : 503 },
    );
  }
  return new Response(upstream.text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: Context) {
  return forward(request, (await context.params).path);
}

export async function POST(request: Request, context: Context) {
  return forward(request, (await context.params).path);
}

export async function PATCH(request: Request, context: Context) {
  return forward(request, (await context.params).path);
}
