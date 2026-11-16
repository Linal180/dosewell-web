import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { auditStamp, type AuditEntry, type Pagination, type User } from "@/lib/types";

export const metadata = { title: "Audit" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: raw } = await searchParams;
  const page = Math.max(1, Number(raw) || 1);
  const { user } = await api<{ user: User }>("/api/v1/auth/me");
  if (user.role === "patient") redirect("/");

  const { audit_logs: logs, pagination } = await api<{ audit_logs: AuditEntry[]; pagination: Pagination }>(
    `/api/v1/audit_logs?page=${page}&per=50`,
  );
  const hasPrev = page > 1;
  const hasNext = page * pagination.per < pagination.total;

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
      {(hasPrev || hasNext) && (
        <p className="window">
          {hasPrev && <Link href={`/audit?page=${page - 1}`}>Previous</Link>}
          <span>
            Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.per))}
          </span>
          {hasNext && <Link href={`/audit?page=${page + 1}`}>Next</Link>}
        </p>
      )}
    </>
  );
}
