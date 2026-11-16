import { DoseActions } from "@/components/DoseActions";
import { utcClock, type Dose } from "@/lib/types";

export function DoseList({ doses, canRecord }: { doses: Dose[]; canRecord: boolean }) {
  if (doses.length === 0) {
    return <p className="empty">Nothing on the schedule for this view.</p>;
  }

  return (
    <ol className="timeline">
      {doses.map((dose) => {
        const due = canRecord && dose.due;
        return (
          <li key={dose.id} className={`dose dose-${dose.status}`}>
            <div className="when">
              <time dateTime={dose.scheduled_at}>{dose.local_time}</time>
              <span>{dose.local_date}</span>
              <span className="muted">{utcClock(dose.scheduled_at)}</span>
            </div>
            <div>
              <strong>{dose.medication.name}</strong>
              <p className="muted">
                {dose.dose_quantity} {dose.dose_unit} · {dose.medication.strength}
                {dose.dst_adjusted ? " · shifted for daylight saving" : ""}
              </p>
            </div>
            <span className={`pill pill-${dose.status}`}>{dose.status}</span>
            <DoseActions id={dose.id} due={due} />
          </li>
        );
      })}
    </ol>
  );
}
