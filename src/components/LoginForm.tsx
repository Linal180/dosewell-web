"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMOS = [
  ["Maya Chen", "maya.chen@dosewell.test", "Doctor"],
  ["Ava Shah", "ava.shah@dosewell.test", "Patient"],
  ["Priya Nair", "priya.nair@dosewell.test", "Pharmacist"],
  ["Sam Okonkwo", "sam.okonkwo@dosewell.test", "Patient"],
] as const;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("maya.chen@dosewell.test");
  const [password, setPassword] = useState("Password1!");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(nextEmail = email, nextPassword = password) {
    setPending(true);
    setError(null);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail, password: nextPassword }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not sign in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form
      className="card form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2>Sign in</h2>
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Enter the clinic"}
      </button>
      <div className="demos">
        {DEMOS.map(([name, demoEmail, role]) => (
          <button
            key={demoEmail}
            type="button"
            className="choice"
            disabled={pending}
            onClick={() => {
              setEmail(demoEmail);
              void submit(demoEmail, "Password1!");
            }}
          >
            {name}
            <span>{role}</span>
          </button>
        ))}
      </div>
    </form>
  );
}
