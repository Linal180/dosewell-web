export type Role = "doctor" | "patient" | "pharmacist";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  timezone: string;
};

export type Medication = {
  id: number;
  name: string;
  generic_name: string;
  ingredient: string;
  strength: string;
  form: string;
  label: string;
};

export type Allergy = { id: number; ingredient: string };

export type SafetyItem = {
  type: string;
  severity: string;
  message: string;
  medication_name?: string;
};

export type Dose = {
  id: number;
  prescription_id: number;
  patient_id: number;
  medication: { id: number; name: string; strength: string };
  dose_quantity: string;
  dose_unit: string;
  scheduled_at: string;
  local_date: string;
  local_time: string;
  timezone: string;
  dst_adjusted: boolean;
  due: boolean;
  status: "scheduled" | "taken" | "missed";
  recorded_at: string | null;
};

export type Prescription = {
  id: number;
  patient_id: number;
  dose_quantity: string;
  dose_unit: string;
  frequency: string;
  interval_hours: number | null;
  times_of_day: string[];
  duration_days: number;
  start_date: string;
  end_date: string;
  timezone: string;
  status: string;
  warnings: SafetyItem[];
  warning_acknowledged: boolean;
  medication: Medication;
  patient: { id: number; name: string };
  doctor: { id: number; name: string };
  dose_count: number;
  doses?: Dose[];
};

export type Adherence = {
  patient_id: number;
  total: number;
  taken: number;
  missed: number;
  scheduled: number;
  percentage: number | null;
};

export type AuditEntry = {
  id: number;
  action: string;
  summary: string;
  auditable_type: string;
  auditable_id: number;
  change_set: Record<string, unknown>;
  created_at: string;
  actor: { id: number; name: string; role: Role };
};

export type PatientDetail = User & {
  allergies: Allergy[];
  prescriptions: Prescription[];
};

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "Europe/London",
  "UTC",
];

export const FREQUENCIES = [
  { value: "once_daily", label: "Once daily", times: 1 },
  { value: "twice_daily", label: "Twice daily", times: 2 },
  { value: "three_times_daily", label: "Three times daily", times: 3 },
  { value: "every_n_hours", label: "Every few hours", times: 1 },
] as const;

export function todayIn(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

export function utcClock(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(date);
  return `${day} ${time} UTC`;
}

export function auditStamp(iso: string) {
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso))} UTC`;
}
