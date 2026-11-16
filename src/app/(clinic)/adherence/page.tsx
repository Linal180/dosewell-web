import Link from "next/link";
import { AdherenceFigure } from "@/components/AdherenceFigure";
import { api } from "@/lib/api";
import type { Adherence, User } from "@/lib/types";

export const metadata = { title: "Adherence" };

export default async function AdherencePage({ searchParams }: { searchParams: Promise<{ patient?: string }> }) {
  const { patient: patientId } = await searchParams;
  const { user } = await api<{ user: User }>("/api/v1/auth/me");

  if (user.role !== "patient" && !patientId) {
    const { patients } = await api<{ patients: User[] }>("/api/v1/patients");
    return (
      <>
        <header className="page-head">
          <p className="eyebrow">Adherence</p>
          <h1>Choose a patient</h1>
        </header>
        <ul className="people">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link href={`/adherence?patient=${patient.id}`}>
                <strong>{patient.name}</strong>
                <span>See adherence</span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const path = user.role === "patient" ? "/api/v1/adherence" : `/api/v1/adherence?patient_id=${patientId}`;
  const { adherence } = await api<{ adherence: Adherence }>(path);

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Adherence</p>
        <h1>Due doses taken</h1>
      </header>
      <AdherenceFigure adherence={adherence} />
      <p className="muted">A past dose still marked scheduled counts as not taken. Future doses are left out.</p>
    </>
  );
}
