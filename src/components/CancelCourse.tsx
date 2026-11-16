"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";

export function CancelCourse({ id }: { id: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setPending(true);
    setError(null);
    const result = await clientApi<{ error?: string }>(`/prescriptions/${id}/cancel`, {
      method: "POST",
      body: "{}",
    });
    setPending(false);
    if (!result.ok) {
      setError(result.data.error || "Could not cancel that course.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="actions">
      <button type="button" className="ghost" disabled={pending} onClick={cancel}>
        {pending ? "Cancelling…" : "Cancel course"}
      </button>
      {error && <span className="error">{error}</span>}
    </span>
  );
}
