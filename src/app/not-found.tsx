import Link from "next/link";
import { cookies } from "next/headers";

export default async function NotFound() {
  const signedIn = Boolean((await cookies()).get("dosewell_token")?.value);

  return (
    <main className="miss">
      <p className="eyebrow">404</p>
      <h1>That page is not on the chart.</h1>
      <p className="muted">The address does not match a clinic page.</p>
      <Link className="text-link" href={signedIn ? "/" : "/login"}>
        {signedIn ? "Back to the clinic" : "Sign in"}
      </Link>
    </main>
  );
}
