import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const wakingMessage = "The clinic is waking up. Wait a few seconds and reload.";

export function apiOrigin() {
  const url = process.env["API_URL"];
  if (!url) throw new Error("API_URL is not set");
  return url.replace(/\/$/, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function readUpstream(url: string, init: RequestInit = {}, attempts = 10) {
  let status = 503;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(url, { ...init, cache: "no-store" });
    const text = await response.text();
    const waking = text.trimStart().startsWith("<");
    if (!waking) {
      let data: { error?: string; token?: string; user?: unknown } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      return { ok: response.ok, status: response.status, data, text };
    }
    status = response.status || 503;
    if (attempt < attempts - 1) await sleep(5000);
  }
  return { ok: false, status, data: { error: wakingMessage }, text: "" };
}

export async function api<T>(path: string): Promise<T> {
  const token = (await cookies()).get("dosewell_token")?.value;
  const result = await readUpstream(`${apiOrigin()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (result.status === 401) redirect("/login");
  if (!result.ok) {
    throw new Error(result.data.error || "The clinic API could not complete that request.");
  }
  return result.data as T;
}
