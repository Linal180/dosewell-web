"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

const LINKS: Record<Role, Array<[string, string]>> = {
  doctor: [
    ["/", "Clinic"],
    ["/patients", "Patients"],
    ["/prescribe", "Prescribe"],
    ["/audit", "Audit"],
  ],
  patient: [
    ["/", "Today"],
    ["/doses", "Schedule"],
    ["/adherence", "Adherence"],
  ],
  pharmacist: [
    ["/", "Clinic"],
    ["/patients", "Patients"],
    ["/audit", "Audit"],
  ],
};

export function Nav({ role }: { role: Role }) {
  const path = usePathname();

  return (
    <nav className="nav">
      {LINKS[role].map(([href, label]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "active" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
