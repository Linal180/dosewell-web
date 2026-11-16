import Link from "next/link";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export const metadata = { title: "Patients" };

export default async function PatientsPage() {
  const { patients } = await api<{ patients: User[] }>("/api/v1/patients");

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Patients</p>
        <h1>Who is being treated</h1>
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
    </>
  );
}
