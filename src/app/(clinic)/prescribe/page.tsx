import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { FormSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const PrescribeForm = dynamic(() => import("@/components/PrescribeForm"), {
  loading: () => <FormSkeleton />,
});

export const metadata = { title: "Prescribe" };

export default async function PrescribePage({ searchParams }: { searchParams: Promise<{ patient?: string }> }) {
  const { patient } = await searchParams;
  const { user } = await api<{ user: User }>("/api/v1/auth/me");
  if (user.role !== "doctor") redirect("/");

  const { patients } = await api<{ patients: User[] }>("/api/v1/patients");
  const initialPatientId = patient ? Number(patient) : undefined;

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Prescribe</p>
        <h1>Write a course</h1>
      </header>
      <PrescribeForm patients={patients} initialPatientId={initialPatientId} />
    </>
  );
}
