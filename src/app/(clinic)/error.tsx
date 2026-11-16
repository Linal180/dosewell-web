"use client";

export default function ClinicError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="card">
      <h1>The clinic is unavailable</h1>
      <p className="muted">{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
