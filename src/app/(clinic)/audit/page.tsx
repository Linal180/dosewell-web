import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { auditStamp, type AuditEntry, type User } from "@/lib/types";

export const metadata = { title: "Audit" };

export default async function AuditPage() {
  const { user } = await api<{ user: User }>("/api/v1/auth/me");
  if (user.role === "patient") redirect("/");

  const { audit_logs: logs } = await api<{ audit_logs: AuditEntry[] }>("/api/v1/audit_logs");

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Audit</p>
        <h1>Who changed what</h1>
      </header>
      {logs.length === 0 ? (
        <p className="empty">No changes have been recorded.</p>
      ) : (
        <ol className="audit">
          {logs.map((log) => (
            <li key={log.id}>
              <time dateTime={log.created_at}>{auditStamp(log.created_at)}</time>
              <div>
                <strong>{log.actor.name}</strong>
                <p>{log.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
