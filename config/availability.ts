// ---------------------------------------------------------------------------
// Staff availability (when a teacher / staff member answers chats) and
// personal quiet hours. Client-safe and pure: used by the profile editor, the
// chat contact panel (shows "Available now" / "Back Sun 07:30") and the chat
// reports, which only count waiting time inside these windows so replies to
// messages sent after hours are not penalised.
// Stored on users.chat_availability / users.quiet_hours (migration 0088).
// ---------------------------------------------------------------------------

/** 0 = Sunday … 6 = Saturday (JS getDay order). */
export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export interface DayHours { day: number; from: string; to: string }

export interface Availability {
  days: DayHours[];
  /** Optional line shown to people messaging them ("I reply within one school day"). */
  note: string | null;
}

export interface QuietWindow { start: string; end: string }

export const AVAILABILITY_NOTE_MAX = 200;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_MS = 86_400_000;

/** School default when a staff member has not set their own hours (chat settings can change it). */
export const DEFAULT_STAFF_HOURS: Availability = { days: [0, 1, 2, 3, 4].map((day) => ({ day, from: "07:30", to: "14:30" })), note: null };

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Valid days only (one window per day, from < to, sorted); null when nothing usable is left. */
export function sanitizeAvailability(input: unknown): Availability | null {
  if (!input || typeof input !== "object") return null;
  const src = input as { days?: unknown; note?: unknown };
  const seen = new Set<number>();
  const days: DayHours[] = [];
  for (const raw of Array.isArray(src.days) ? src.days : []) {
    if (!raw || typeof raw !== "object") continue;
    const d = raw as Partial<DayHours>;
    const day = Number(d.day);
    if (!Number.isInteger(day) || day < 0 || day > 6 || seen.has(day)) continue;
    const from = String(d.from ?? "");
    const to = String(d.to ?? "");
    if (!HHMM.test(from) || !HHMM.test(to) || toMinutes(from) >= toMinutes(to)) continue;
    seen.add(day);
    days.push({ day, from, to });
  }
  days.sort((a, b) => a.day - b.day);
  const note = typeof src.note === "string" ? src.note.trim().slice(0, AVAILABILITY_NOTE_MAX) || null : null;
  return days.length ? { days, note } : null;
}

export function sanitizeQuietWindow(input: unknown): QuietWindow | null {
  if (!input || typeof input !== "object") return null;
  const q = input as Partial<QuietWindow>;
  const start = String(q.start ?? "");
  const end = String(q.end ?? "");
  return HHMM.test(start) && HHMM.test(end) && start !== end ? { start, end } : null;
}

/** True when `minutes` (since local midnight) is inside the window (which may wrap midnight). */
export function inWindow(q: QuietWindow | null | undefined, minutes: number): boolean {
  if (!q) return false;
  const s = toMinutes(q.start);
  const e = toMinutes(q.end);
  return s < e ? minutes >= s && minutes < e : minutes >= s || minutes < e;
}

/** Minutes until the window ends (0 when outside it). */
export function minutesUntilWindowEnds(q: QuietWindow | null | undefined, minutes: number): number {
  if (!q || !inWindow(q, minutes)) return 0;
  return (toMinutes(q.end) - minutes + 1440) % 1440;
}

// ------------------------------------------------------------------ time zones

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = fmtCache.get(timeZone);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    } catch {
      f = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    }
    fmtCache.set(timeZone, f);
  }
  return f;
}

/** Offset of the zone from UTC at `at`, in minutes (Asia/Muscat → 240). */
export function zoneOffsetMinutes(at: number, timeZone: string): number {
  const p = Object.fromEntries(formatter(timeZone).formatToParts(new Date(at)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute), Number(p.second));
  return Math.round((asUtc - Math.floor(at / 1000) * 1000) / 60_000);
}

export interface LocalClock { day: number; minutes: number; date: string }

/** Weekday, minutes since midnight and YYYY-MM-DD of `at` in the zone. */
export function localClock(at: Date | number, timeZone: string): LocalClock {
  const ms = typeof at === "number" ? at : at.getTime();
  const local = new Date(ms + zoneOffsetMinutes(ms, timeZone) * 60_000);
  return { day: local.getUTCDay(), minutes: local.getUTCHours() * 60 + local.getUTCMinutes(), date: local.toISOString().slice(0, 10) };
}

// ------------------------------------------------------------------ availability maths

export function hoursFor(av: Availability, day: number): DayHours | null {
  return av.days.find((d) => d.day === day) ?? null;
}

export function isAvailable(av: Availability, day: number, minutes: number): boolean {
  const h = hoursFor(av, day);
  return !!h && minutes >= toMinutes(h.from) && minutes < toMinutes(h.to);
}

export interface AvailabilityStatus {
  available: boolean;
  /** Today's end time while available. */
  until: string | null;
  /** Next window start when away (day 0–6, "HH:MM"); `today` when it starts later today. */
  next: { day: number; from: string; today: boolean } | null;
}

export function availabilityStatus(av: Availability, clock: Pick<LocalClock, "day" | "minutes">): AvailabilityStatus {
  const today = hoursFor(av, clock.day);
  if (today && clock.minutes >= toMinutes(today.from) && clock.minutes < toMinutes(today.to)) return { available: true, until: today.to, next: null };
  if (today && clock.minutes < toMinutes(today.from)) return { available: false, until: null, next: { day: clock.day, from: today.from, today: true } };
  for (let i = 1; i <= 7; i++) {
    const day = (clock.day + i) % 7;
    const h = hoursFor(av, day);
    if (h) return { available: false, until: null, next: { day, from: h.from, today: false } };
  }
  return { available: false, until: null, next: null };
}

/**
 * Minutes between two instants that fall inside the availability windows (in
 * the school's zone). A message sent at 22:00 and answered at 08:00 by someone
 * available from 07:30 counts as 30 minutes.
 */
export function availableMinutesBetween(av: Availability, start: number, end: number, timeZone: string, offsets?: { start: number; end: number }): number {
  if (!(end > start) || !av.days.length) return 0;
  const sL = start + (offsets?.start ?? zoneOffsetMinutes(start, timeZone)) * 60_000;
  const eL = end + (offsets?.end ?? zoneOffsetMinutes(end, timeZone)) * 60_000;
  if (!(eL > sL)) return 0;
  const byDay = new Map(av.days.map((d) => [d.day, [toMinutes(d.from) * 60_000, toMinutes(d.to) * 60_000] as const]));
  let total = 0;
  const first = Math.floor(sL / DAY_MS);
  const last = Math.min(Math.floor(eL / DAY_MS), first + 400);
  for (let d = first; d <= last; d++) {
    const w = byDay.get(new Date(d * DAY_MS).getUTCDay());
    if (!w) continue;
    const ws = d * DAY_MS + w[0];
    const we = d * DAY_MS + w[1];
    total += Math.max(0, Math.min(we, eL) - Math.max(ws, sL));
  }
  return total / 60_000;
}

/** Weekly available minutes (for "set hours" summaries). */
export function weeklyMinutes(av: Availability): number {
  return av.days.reduce((s, d) => s + toMinutes(d.to) - toMinutes(d.from), 0);
}
