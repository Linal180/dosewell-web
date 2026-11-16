import Link from "next/link";
import { Nav } from "@/components/Nav";
import type { User } from "@/lib/types";

export function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="rail">
        <Link className="brand" href="/">
          <span className="mark" aria-hidden="true" />
          Dosewell
        </Link>
        <p className="who">
          {user.name}
          <span>{user.role}</span>
        </p>
        <Nav role={user.role} />
        <form action="/api/logout" method="post">
          <button className="text-button" type="submit">
            Sign out
          </button>
        </form>
      </aside>
      <div className="main">
        {user.role === "pharmacist" && (
          <p className="banner">Read only. You can review schedules, adherence, and the audit log.</p>
        )}
        {children}
      </div>
    </div>
  );
}
