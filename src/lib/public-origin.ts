export function publicOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim() || "";
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = forwardedProto || (local ? "http" : "https");

  if (host && !host.startsWith("0.0.0.0")) return `${proto}://${host}`;
  return new URL(request.url).origin;
}
