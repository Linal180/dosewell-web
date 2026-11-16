import Link from "next/link";
import { AdherenceFigure } from "@/components/AdherenceFigure";
import { api } from "@/lib/api";
import type { Adherence, PatientDetail, User } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Patient ${id}` };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ user }, { patient }, { adherence }] = await Promise.all([
    api<{ user: User }>("/api/v1/auth/me"),
    api<{ patient: PatientDetail }>(`/api/v1/patients/${id}`),
    api<{ adherence: Adherence }>(`/api/v1/adherence?patient_id=${id}`),
  ]);

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{patient.timezone}</p>
        <h1>{patient.name}</h1>
      </header>
      <AdherenceFigure adherence={adherence} />
      <section className="split-cards">
        <article className="card">
          <h2>Allergies</h2>
          {patient.allergies.length === 0 ? (
            <p className="muted">None recorded.</p>
          ) : (
            <ul className="tags">
              {patient.allergies.map((allergy) => (
                <li key={allergy.id}>{allergy.ingredient}</li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h2>Courses</h2>
          {patient.prescriptions.length === 0 ? (
            <p className="muted">No prescriptions yet.</p>
          ) : (
            <ul className="plain">
              {patient.prescriptions.map((prescription) => (
                <li key={prescription.id}>
                  <strong>
                    {prescription.medication.name} {prescription.medication.strength}
                  </strong>
                  <p className="muted">
                    {prescription.dose_quantity} {prescription.dose_unit}, {prescription.frequency.replaceAll("_", " ")},{" "}
                    {prescription.duration_days} days from {prescription.start_date}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {user.role === "doctor" && (
            <Link className="text-link" href={`/prescribe?patient=${patient.id}`}>
              Prescribe
            </Link>
          )}
          <Link className="text-link" href={`/doses?patient=${patient.id}`}>
            Open schedule
          </Link>
        </article>
      </section>
    </>
  );
}
