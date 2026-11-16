import Link from "next/link";
import { DoseList } from "@/components/DoseList";
import { api } from "@/lib/api";
import { shiftISODate, todayIn, type Dose, type User } from "@/lib/types";

export const metadata = { title: "Schedule" };

export default async function DosesPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; from?: string; to?: string }>;
}) {
  const { patient: patientId, from: fromParam, to: toParam } = await searchParams;
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

  const zone = user.role === "patient" ? user.timezone : (await api<{ patient: User }>(`/api/v1/patients/${patientId}`)).patient.timezone;
  const today = todayIn(zone);
  const from = fromParam || shiftISODate(today, -7);
  const to = toParam || shiftISODate(today, 14);
  const patientQuery = user.role === "patient" ? "" : `&patient_id=${patientId}`;
  const { doses } = await api<{ doses: Dose[] }>(`/api/v1/doses?from=${from}&to=${to}&per=100${patientQuery}`);
  const query = user.role === "patient" ? "" : `patient=${patientId}&`;

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Schedule</p>
        <h1>Doses in local time</h1>
      </header>
      <p className="window">
        <Link href={`/doses?${query}from=${shiftISODate(from, -21)}&to=${shiftISODate(from, -1)}`}>Earlier</Link>
        <span>
          {from} to {to}
        </span>
        <Link href={`/doses?${query}from=${shiftISODate(to, 1)}&to=${shiftISODate(to, 21)}`}>Later</Link>
      </p>
      <DoseList doses={doses} canRecord={user.role === "patient"} />
    </>
  );
}
