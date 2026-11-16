import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="login">
      <section className="login-copy">
        <p className="eyebrow">Dosewell</p>
        <h1>The dose, on the day it was meant for.</h1>
        <p>Doctors prescribe. Patients mark what happened. Pharmacists can look, and cannot change the record.</p>
      </section>
      <LoginForm />
    </main>
  );
}
