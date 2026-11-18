// ---------------------------------------------------------------------------
// Recurrence rules for service schedules, task series, recurring expenses and
// recurring fee templates. Deliberately simpler than RFC 5545 RRULE: a JSON
// object that non-technical staff can configure from a form and that we can
// evaluate without a dependency. Stored as JSON in `recurrence` columns.
//
//   { freq: "monthly", interval: 1, byMonthDay: 1 }       → 1st of every month
//   { freq: "weekly", interval: 2, byWeekDay: [1, 4] }    → Mon & Thu, every other week
//   { freq: "yearly", byMonth: 6, byMonthDay: 15 }        → 15 June yearly
//   { freq: "daily", interval: 3 }                        → every 3 days
//
// All dates are calendar dates (YYYY-MM-DD) in the school's local sense; the
// crons run daily and materialise anything whose next date is <= today.
// ---------------------------------------------------------------------------

import { z } from "zod";

export const RECURRENCE_FREQS = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;
export type RecurrenceFreq = (typeof RECURRENCE_FREQS)[number];

export const recurrenceSchema = z.object({
  freq: z.enum(RECURRENCE_FREQS),
  /** Every N periods (default 1). */
  interval: z.number().int().min(1).max(365).default(1),
  /** 0 = Sunday … 6 = Saturday (weekly). */
  byWeekDay: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  /** 1..31 — clamped to the month length (monthly/quarterly/yearly). */
  byMonthDay: z.number().int().min(1).max(31).optional(),
  /** 1..12 (yearly). */
  byMonth: z.number().int().min(1).max(12).optional(),
  /** Stop after this date (inclusive). */
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  /** Stop after N occurrences (tracked by the caller). */
  count: z.number().int().min(1).nullable().optional(),
});
export type Recurrence = z.infer<typeof recurrenceSchema>;

export function parseRecurrence(raw: unknown): Recurrence | null {
  const value = typeof raw === "string" ? safeJson(raw) : raw;
  const parsed = recurrenceSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}

const pad = (n: number) => String(n).padStart(2, "0");
export const toDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
export const fromDate = (d: Date): string => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function daysInMonth(y: number, m0: number): number {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

function addMonthsClamped(d: Date, months: number, day: number | undefined): Date {
  const y = d.getUTCFullYear();
  const m0 = d.getUTCMonth() + months;
  const target = new Date(Date.UTC(y, m0, 1));
  const wanted = day ?? d.getUTCDate();
  target.setUTCDate(Math.min(wanted, daysInMonth(target.getUTCFullYear(), target.getUTCMonth())));
  return target;
}

/**
 * First occurrence strictly after `after` (YYYY-MM-DD). Returns null when the
 * rule has ended (`until`). Pure and deterministic.
 */
export function nextOccurrence(rule: Recurrence, after: string): string | null {
  const a = toDate(after);
  let next: Date;
  switch (rule.freq) {
    case "daily": {
      next = new Date(a);
      next.setUTCDate(next.getUTCDate() + rule.interval);
      break;
    }
    case "weekly": {
      const days = rule.byWeekDay && rule.byWeekDay.length ? [...rule.byWeekDay].sort((x, y) => x - y) : [a.getUTCDay()];
      // Try later weekdays in the same week, else jump `interval` weeks to the first chosen weekday.
      const dow = a.getUTCDay();
      const later = days.find((d) => d > dow);
      next = new Date(a);
      if (later !== undefined) next.setUTCDate(a.getUTCDate() + (later - dow));
      else next.setUTCDate(a.getUTCDate() - dow + days[0] + 7 * rule.interval);
      break;
    }
    case "monthly":
      next = addMonthsClamped(a, rule.interval, rule.byMonthDay);
      // When byMonthDay is later in the current month than `after`, that date is the next occurrence.
      if (rule.byMonthDay && rule.byMonthDay > a.getUTCDate()) {
        const sameMonth = addMonthsClamped(a, 0, rule.byMonthDay);
        if (sameMonth > a) next = sameMonth;
      }
      break;
    case "quarterly":
      next = addMonthsClamped(a, 3 * rule.interval, rule.byMonthDay);
      break;
    case "yearly": {
      const month0 = rule.byMonth ? rule.byMonth - 1 : a.getUTCMonth();
      const day = rule.byMonthDay ?? a.getUTCDate();
      const thisYear = new Date(Date.UTC(a.getUTCFullYear(), month0, 1));
      thisYear.setUTCDate(Math.min(day, daysInMonth(a.getUTCFullYear(), month0)));
      if (thisYear > a) next = thisYear;
      else {
        const y = a.getUTCFullYear() + rule.interval;
        next = new Date(Date.UTC(y, month0, 1));
        next.setUTCDate(Math.min(day, daysInMonth(y, month0)));
      }
      break;
    }
  }
  const out = fromDate(next);
  if (rule.until && out > rule.until) return null;
  return out;
}

/** Period covered by an occurrence (for bills): [start, end] where end is the day before the following occurrence. */
export function occurrencePeriod(rule: Recurrence, start: string): { start: string; end: string } {
  const nxt = nextOccurrence({ ...rule, until: null }, start) ?? start;
  const end = toDate(nxt);
  end.setUTCDate(end.getUTCDate() - 1);
  return { start, end: end < toDate(start) ? start : fromDate(end) };
}

/** Human-friendly summary key + params for i18n (`recurrence.summary.<freq>`). */
export function describeRecurrence(rule: Recurrence): { key: string; params: Record<string, unknown> } {
  return { key: `recurrence.summary.${rule.freq}`, params: { interval: rule.interval, day: rule.byMonthDay ?? null, month: rule.byMonth ?? null, weekdays: rule.byWeekDay ?? [] } };
}
