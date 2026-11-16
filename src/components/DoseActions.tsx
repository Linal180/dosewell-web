"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";

export function DoseActions({ id, due }: { id: number; due: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<"taken" | "missed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!due) return null;

  async function record(status: "taken" | "missed") {
    setPending(status);
    setError(null);
    const result = await clientApi<{ error?: string }>(`/doses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ dose: { status } }),
    });
    setPending(null);
    if (!result.ok) {
      setError(result.data.error || "Could not record that dose.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="actions">
      <button type="button" disabled={pending !== null} onClick={() => record("taken")}>
        {pending === "taken" ? "Saving…" : "Taken"}
      </button>
      <button type="button" className="ghost" disabled={pending !== null} onClick={() => record("missed")}>
        {pending === "missed" ? "Saving…" : "Missed"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
