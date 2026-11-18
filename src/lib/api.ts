import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function apiOrigin() {
  const url = process.env["API_URL"];
  if (!url) throw new Error("API_URL is not set");
  return url.replace(/\/$/, "");
}

export async function api<T>(path: string): Promise<T> {
  const token = (await cookies()).get("dosewell_token")?.value;
  const response = await fetch(`${apiOrigin()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (response.status === 401) redirect("/login");

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "The clinic API could not complete that request.");
  }
  return data as T;
}
