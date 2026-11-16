import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClinicLayout({ children }: { children: React.ReactNode }) {
  const { user } = await api<{ user: User }>("/api/v1/auth/me");
  return <Shell user={user}>{children}</Shell>;
}
