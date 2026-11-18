import Link from "next/link";
import { Shell } from "@/components/Shell";
import { api, wakingMessage } from "@/lib/api";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

function redirecting(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export default async function ClinicLayout({ children }: { children: React.ReactNode }) {
  let user: User;
  try {
    ({ user } = await api<{ user: User }>("/api/v1/auth/me"));
  } catch (error) {
    if (redirecting(error)) throw error;
    const message = error instanceof Error ? error.message : wakingMessage;
    return (
      <main className="miss">
        <p className="eyebrow">Dosewell</p>
        <h1>The clinic is waking up.</h1>
        <p className="muted">{message}</p>
        <Link className="text-link" href="/">
          Reload
        </Link>
      </main>
    );
  }
  return <Shell user={user}>{children}</Shell>;
}
