import Link from "next/link";
import { AdherenceFigure } from "@/components/AdherenceFigure";
import { DoseList } from "@/components/DoseList";
import { api } from "@/lib/api";
import { todayIn, type Adherence, type Dose, type Prescription, type User } from "@/lib/types";

export default async function DashboardPage() {
  const { user } = await api<{ user: User }>("/api/v1/auth/me");

  if (user.role === "patient") {
    const today = todayIn(user.timezone);
    const [{ doses }, { adherence }] = await Promise.all([
      api<{ doses: Dose[] }>(`/api/v1/doses?from=${today}&to=${today}&per=100`),
      api<{ adherence: Adherence }>("/api/v1/adherence"),
    ]);
    const dueToday = doses.filter((dose) => dose.local_date === today);

    return (
      <>
        <header className="page-head">
          <p className="eyebrow">{today}</p>
          <h1>Today in {user.timezone}</h1>
        </header>
        <AdherenceFigure adherence={adherence} />
        <DoseList doses={dueToday} canRecord />
      </>
    );
  }

  const [{ patients }, { prescriptions }] = await Promise.all([
    api<{ patients: User[] }>("/api/v1/patients"),
    api<{ prescriptions: Prescription[] }>("/api/v1/prescriptions"),
  ]);

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Clinic</p>
        <h1>{patients.length} patients on the list</h1>
      </header>
      <ul className="people">
        {patients.map((patient) => (
          <li key={patient.id}>
            <Link href={`/patients/${patient.id}`}>
              <strong>{patient.name}</strong>
              <span>{patient.timezone}</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2>Recent prescriptions</h2>
      <ul className="people">
        {prescriptions.slice(0, 6).map((prescription) => (
          <li key={prescription.id}>
            <Link href={`/patients/${prescription.patient_id}`}>
              <strong>
                {prescription.medication.name} {prescription.medication.strength}
              </strong>
              <span>
                {prescription.patient.name} · {prescription.dose_count} doses
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
