import Link from "next/link";
import { DoseList } from "@/components/DoseList";
import { api } from "@/lib/api";
import type { Dose, User } from "@/lib/types";

export const metadata = { title: "Schedule" };

export default async function DosesPage({ searchParams }: { searchParams: Promise<{ patient?: string }> }) {
  const { patient: patientId } = await searchParams;
  const { user } = await api<{ user: User }>("/api/v1/auth/me");

  if (user.role !== "patient" && !patientId) {
    const { patients } = await api<{ patients: User[] }>("/api/v1/patients");
    return (
      <>
        <header className="page-head">
          <p className="eyebrow">Schedule</p>
          <h1>Choose a patient</h1>
        </header>
        <ul className="people">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link href={`/doses?patient=${patient.id}`}>
                <strong>{patient.name}</strong>
                <span>Open doses</span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const path = user.role === "patient" ? "/api/v1/doses" : `/api/v1/doses?patient_id=${patientId}`;
  const { doses } = await api<{ doses: Dose[] }>(path);

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Schedule</p>
        <h1>Doses in local time</h1>
      </header>
      <DoseList doses={doses} canRecord={user.role === "patient"} />
    </>
  );
}
