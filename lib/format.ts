export function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar" : "en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Formats an "HH:mm[:ss]" time string as "hh:mm A" (Arabic: ص/م). Same as `clock12`. */
export function formatTime12(time: string, isAr = false): string {
  return clock12((time || "").trim(), isAr);
}

/** "HH:mm" or a "YYYY-MM-DD HH:mm" wall time → zero-padded 12-hour parts { hm: "04:30", ap: "PM" | "م" }. */
export function clockParts(time: string, isAr = false): { hm: string; ap: string } | null {
  const m = /(\d{1,2}):(\d{2})(?!\d)/.exec(time.length > 8 ? time.slice(10) : time);
  if (!m) return null;
  const h24 = Number(m[1]) % 24;
  return { hm: `${String(h24 % 12 || 12).padStart(2, "0")}:${m[2]}`, ap: h24 >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM") };
}

/** "hh:mm A": "04:30 PM" / "04:30 م" (latin digits in both languages). */
export function clock12(time: string, isAr = false): string {
  const p = clockParts(time, isAr);
  return p ? `${p.hm} ${p.ap}` : time;
}

/**
 * "04:30–04:40 PM", with AM/PM once when both ends share it ("11:50 AM–12:10 PM" otherwise). In Arabic the range is an
 * isolated RTL run so it always reads right-to-left (start on the right), whatever text surrounds it.
 */
export function clockRange12(from: string, to: string, isAr = false): string {
  const a = clockParts(from, isAr);
  const b = clockParts(to, isAr);
  const out = !a || !b ? `${clock12(from, isAr)}–${clock12(to, isAr)}` : a.ap !== b.ap ? `${a.hm} ${a.ap}–${b.hm} ${b.ap}` : `${a.hm}–${b.hm} ${b.ap}`;
  return isAr ? `\u2067${out}\u2069` : out;
}

/** Rewrites the 24-hour times inside a text (e.g. a server's clash detail "16:00–16:10") as 12-hour. */
export function clocks12(text: string, isAr = false): string {
  return text.replace(/\b(\d{2}:\d{2})(?:–(\d{2}:\d{2}))?\b/g, (_, a: string, b?: string) => (b ? clockRange12(a, b, isAr) : clock12(a, isAr)));
}

/** WhatsApp-style relative timestamp: now → minutes → hours → days → short date. */
export function timeAgo(dateInput: string | Date, locale: string): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  if (!Number.isFinite(diffMs)) return "";
  const isAr = locale === "ar";
  const mins = Math.floor(Math.max(0, diffMs) / 60_000);
  if (mins < 1) return isAr ? "الآن" : "now";
  const rtf = new Intl.RelativeTimeFormat(isAr ? "ar" : "en", { numeric: "auto" });
  if (mins < 60) return rtf.format(-mins, "minute");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, "day");
  return new Intl.DateTimeFormat(isAr ? "ar-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/** "12 Mar 2026" / "12 مارس 2026" (latin digits). */
export function fmtDate(value: string | Date | null | undefined, locale: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** A calendar date ("YYYY-MM-DD", no time zone shift): "Sun, 10 Jan 2027" / "الأحد، 10 يناير 2027" (latin digits). */
export function fmtDay(ymd: string | null | undefined, locale: string, weekday = true): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}/.test(ymd)) return ymd ?? "";
  const d = new Date(`${ymd.slice(0, 10)}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en-GB", {
    timeZone: "UTC", day: "numeric", month: "short", year: "numeric", ...(weekday ? { weekday: locale === "ar" ? "long" : "short" } : {}),
  }).format(d);
}

type Instant = string | number | Date | null | undefined;

const toDate = (value: Instant): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const dateLoc = (locale: string) => (locale.startsWith("ar") ? "ar-u-nu-latn" : "en-GB");
const stampSep = (locale: string) => (locale.startsWith("ar") ? "، " : ", ");

/** "HH:mm" (24h) of an instant in `timeZone` (else the browser's): the input for `clock12`. */
export function wallClock(value: Instant, timeZone?: string): string {
  const d = toDate(value);
  if (!d) return "";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", ...(timeZone ? { timeZone } : {}) }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.hour}:${p.minute}`;
}

/** An instant (ISO / Date / epoch ms) → "hh:mm A" ("04:30 PM" / "04:30 م") in `timeZone` (else the browser's). */
export function fmtClock(value: Instant, locale: string, timeZone?: string): string {
  const w = wallClock(value, timeZone);
  return w ? clock12(w, locale.startsWith("ar")) : "";
}

/** Two instants → "04:30–05:10 PM" (see `clockRange12`). */
export function fmtClockRange(from: Instant, to: Instant, locale: string, timeZone?: string): string {
  const a = wallClock(from, timeZone);
  const b = wallClock(to, timeZone);
  if (!a) return "";
  return b ? clockRange12(a, b, locale.startsWith("ar")) : clock12(a, locale.startsWith("ar"));
}

/**
 * An instant → its date (Intl `dateOpts`, latin digits) + "hh:mm A": "4 Nov 2026, 04:30 PM" / "4 نوفمبر 2026، 04:30 م".
 * Use instead of Intl `timeStyle` / `hour` options, which give 24-hour times in en-GB.
 */
export function fmtStamp(value: Instant, locale: string, dateOpts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }, timeZone?: string): string {
  const d = toDate(value);
  if (!d) return "";
  const date = new Intl.DateTimeFormat(dateLoc(locale), { ...dateOpts, ...(timeZone ? { timeZone } : {}) }).format(d);
  return `${date}${stampSep(locale)}${fmtClock(d, locale, timeZone)}`;
}

/** A "YYYY-MM-DD HH:mm" wall-clock value (no time zone) → date (Intl `dateOpts`) + "hh:mm A". Date-only values give just the date. */
export function fmtWallStamp(wall: string | null | undefined, locale: string, dateOpts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  if (!wall || !/^\d{4}-\d{2}-\d{2}/.test(wall)) return wall ?? "";
  const date = new Intl.DateTimeFormat(dateLoc(locale), { ...dateOpts, timeZone: "UTC" }).format(new Date(`${wall.slice(0, 10)}T00:00:00Z`));
  const time = /^\d{4}-\d{2}-\d{2}[ T](\d{2}:\d{2})/.exec(wall)?.[1];
  return time ? `${date}${stampSep(locale)}${clock12(time, locale.startsWith("ar"))}` : date;
}

/** Date + 12-hour time (in `timeZone` when given, else the browser's): "4 Nov 2026, 04:30 PM". */
export function fmtDateTime(value: string | Date | null | undefined, locale: string, timeZone?: string): string {
  return fmtStamp(value, locale, undefined, timeZone);
}
