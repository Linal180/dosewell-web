"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  FREQUENCIES,
  TIMEZONES,
  todayIn,
  type Medication,
  type SafetyItem,
  type User,
} from "@/lib/types";

type Failure = {
  error?: string;
  code?: string;
  blocked?: SafetyItem[];
  warnings?: SafetyItem[];
  details?: Record<string, string[]>;
};

const DEFAULT_TIMES: Record<string, string[]> = {
  once_daily: ["08:00"],
  twice_daily: ["08:00", "20:00"],
  three_times_daily: ["08:00", "14:00", "20:00"],
  every_n_hours: ["08:00"],
};

export default function PrescribeForm({
  patients,
  initialPatientId,
}: {
  patients: User[];
  initialPatientId?: number;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(initialPatientId ?? patients[0]?.id);
  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [medicationId, setMedicationId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<string>("once_daily");
  const [times, setTimes] = useState(DEFAULT_TIMES.once_daily);
  const [intervalHours, setIntervalHours] = useState(8);
  const [timezone, setTimezone] = useState(patient?.timezone ?? "America/New_York");
  const [startDate, setStartDate] = useState(todayIn(patient?.timezone ?? "UTC"));
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("tablet");
  const [duration, setDuration] = useState("7");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [failureFor, setFailureFor] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const signature = [
    patient?.id,
    medicationId,
    frequency,
    times.join("|"),
    intervalHours,
    startDate,
    duration,
    timezone,
    quantity,
    unit,
  ].join("~");

  const zones = useMemo(() => {
    const extra = patient && !TIMEZONES.includes(patient.timezone) ? [patient.timezone] : [];
    return [...extra, ...TIMEZONES];
  }, [patient]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const term = debouncedQuery.trim();
    const path = term ? `/medications?q=${encodeURIComponent(term)}` : "/medications";
    clientApi<{ medications: Medication[] }>(path, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setMedications(result.data.medications);
          setSearchError(null);
        } else {
          setMedications([]);
          setSearchError("Could not load medications");
        }
        setLoadedQuery(term);
      })
      .catch((error: Error) => {
        if (!active || error.name === "AbortError") return;
        setMedications([]);
        setSearchError("Could not load medications");
        setLoadedQuery(term);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  function choosePatient(id: number) {
    const next = patients.find((item) => item.id === id);
    setPatientId(id);
    if (!next) return;
    setTimezone(next.timezone);
    setStartDate(todayIn(next.timezone));
  }

  function chooseFrequency(value: string) {
    setFrequency(value);
    setTimes(DEFAULT_TIMES[value] ?? ["08:00"]);
  }

  async function submit(acknowledge: boolean) {
    if (!patient || !medicationId) return;
    setPending(true);
    setFailure(null);
    const result = await clientApi<Failure & { prescription?: { patient_id: number } }>("/prescriptions", {
      method: "POST",
      body: JSON.stringify({
        prescription: {
          patient_id: patient.id,
          medication_id: medicationId,
          dose_quantity: Number(quantity),
          dose_unit: unit,
          frequency,
          times_of_day: times,
          duration_days: Number(duration),
          start_date: startDate,
          timezone,
          ...(frequency === "every_n_hours" ? { interval_hours: intervalHours } : {}),
          acknowledge_warnings: acknowledge,
        },
      }),
    });
    setPending(false);
    if (!result.ok) {
      setFailure(result.data);
      setFailureFor(signature);
      return;
    }
    router.push(`/patients/${patient.id}`);
    router.refresh();
  }

  if (!patient) return <p className="empty">No patients are on the list.</p>;

  const shown = failureFor === signature ? failure : null;
  const detailLines = Object.entries(shown?.details ?? {}).flatMap(([field, messages]) =>
    messages.map((message) => `${field.replaceAll("_", " ")} ${message}`),
  );

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <label>
        Patient
        <select value={patient.id} onChange={(event) => choosePatient(Number(event.target.value))}>
          {patients.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Medication
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name"
          autoComplete="off"
        />
      </label>
      {searchError && <p className="error">{searchError}</p>}
      {loadedQuery !== debouncedQuery.trim() ? (
        <div className="skeleton short" aria-hidden="true" />
      ) : (
        <div className="choices">
          {medications.map((medication) => (
            <button
              key={medication.id}
              type="button"
              className={medication.id === medicationId ? "choice selected" : "choice"}
              onClick={() => setMedicationId(medication.id)}
            >
              {medication.label}
              <span>{medication.form}</span>
            </button>
          ))}
        </div>
      )}

      <div className="split">
        <label>
          Dose
          <input type="number" min="0.25" max="100" step="0.25" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
        </label>
        <label>
          Unit
          <select value={unit} onChange={(event) => setUnit(event.target.value)}>
            {["tablet", "capsule", "ml", "mg", "mcg", "puff"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Frequency
        <select value={frequency} onChange={(event) => chooseFrequency(event.target.value)}>
          {FREQUENCIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {frequency === "every_n_hours" && (
        <label>
          Hours between doses
          <input
            type="number"
            min="1"
            max="24"
            value={intervalHours}
            onChange={(event) => setIntervalHours(Number(event.target.value))}
            required
          />
        </label>
      )}

      <fieldset>
        <legend>Times of day</legend>
        <div className="split">
          {times.map((time, index) => (
            <input
              key={index}
              type="time"
              value={time}
              required
              onChange={(event) => setTimes(times.map((value, cursor) => (cursor === index ? event.target.value : value)))}
            />
          ))}
        </div>
      </fieldset>

      <div className="split">
        <label>
          Starts
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </label>
        <label>
          Days
          <input type="number" min="1" max="365" value={duration} onChange={(event) => setDuration(event.target.value)} required />
        </label>
      </div>

      <label>
        Timezone
        <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
          {zones.map((zone) => (
            <option key={zone}>{zone}</option>
          ))}
        </select>
      </label>

      {shown && (
        <div className={shown.code === "acknowledgement_required" ? "notice warn" : "notice danger"} role="alert">
          <strong>{shown.error}</strong>
          {[...(shown.blocked ?? []), ...(shown.code === "blocked" ? shown.warnings ?? [] : [])].map((item) => (
            <p key={`${item.type}-${item.message}`}>{item.message}</p>
          ))}
          {shown.code === "acknowledgement_required" &&
            shown.warnings?.map((item) => <p key={`${item.type}-${item.message}`}>{item.message}</p>)}
          {detailLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      <div className="split">
        <button type="submit" disabled={pending || !medicationId}>
          {pending ? "Checking…" : "Prescribe"}
        </button>
        {shown?.code === "acknowledgement_required" && (
          <button type="button" className="ghost" disabled={pending} onClick={() => submit(true)}>
            {pending ? "Saving…" : "Acknowledge and prescribe"}
          </button>
        )}
      </div>
    </form>
  );
}
