import type { Adherence } from "@/lib/types";

export function AdherenceFigure({ adherence }: { adherence: Adherence }) {
  const value = adherence.percentage;

  return (
    <section className="meter">
      <p className="meter-value">{value == null ? "—" : `${value}%`}</p>
      <p className="muted">{value == null ? "No doses are due yet." : "of due doses marked taken"}</p>
      <div className="meter-bar" aria-hidden="true">
        <span style={{ width: `${value ?? 0}%` }} />
      </div>
      <ul className="counts">
        <li><strong>{adherence.taken}</strong> taken</li>
        <li><strong>{adherence.missed}</strong> missed</li>
        <li><strong>{adherence.scheduled}</strong> still open</li>
      </ul>
      {adherence.courses && adherence.courses.length > 1 && (
        <ul className="plain">
          {adherence.courses.map((course) => (
            <li key={course.prescription_id}>
              <strong>{course.medication}</strong>
              <span className="muted">{course.percentage == null ? "No doses due" : `${course.percentage}%`}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
