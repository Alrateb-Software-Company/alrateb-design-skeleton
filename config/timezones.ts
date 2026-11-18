// Time zones (client + server safe, no I/O): every IANA zone a school can pick, which zones belong to a country,
// and labels with the current GMT offset. Unit-tested in tests/unit/timezones.test.ts.

import { COUNTRY_ZONES } from "./timezones-data";

export const DEFAULT_TIMEZONE = "Asia/Muscat";

/** Old IANA names some runtimes / stored rows still use → today's name. */
const LEGACY: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata", "Europe/Kiev": "Europe/Kyiv", "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon", "America/Godthab": "America/Nuuk", "Atlantic/Faeroe": "Atlantic/Faroe", "Pacific/Truk": "Pacific/Chuuk",
  "Pacific/Ponape": "Pacific/Pohnpei", "Pacific/Enderbury": "Pacific/Kanton", "Africa/Asmera": "Africa/Asmara", "Asia/Ulan_Bator": "Asia/Ulaanbaatar",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires", "America/Indianapolis": "America/Indiana/Indianapolis", "Asia/Istanbul": "Europe/Istanbul",
  "Etc/UTC": "UTC", "Etc/GMT": "UTC", GMT: "UTC", "Europe/Belfast": "Europe/London", "Asia/Tel_Aviv": "Asia/Jerusalem",
};

let zoneCountries: Map<string, string[]> | null = null;
function byZone(): Map<string, string[]> {
  if (!zoneCountries) {
    zoneCountries = new Map();
    for (const [code, zones] of Object.entries(COUNTRY_ZONES)) {
      if (code.length !== 2) continue;
      for (const z of zones) zoneCountries.set(z, [...(zoneCountries.get(z) ?? []), code]);
    }
  }
  return zoneCountries;
}

let all: string[] | null = null;
/** Every zone a school can pick (sorted), plus UTC. */
export function allTimezones(): string[] {
  if (!all) all = [...new Set([...byZone().keys(), "UTC"])].sort();
  return all;
}

/** Today's IANA name for a zone (legacy aliases resolved); trims, keeps unknown values as they are. */
export function canonicalZone(zone: string | null | undefined): string {
  const z = String(zone ?? "").trim();
  return LEGACY[z] ?? z;
}

/** The country's zones, its main zone first (empty when unknown). */
export function zonesForCountry(code: string | null | undefined): readonly string[] {
  return code ? COUNTRY_ZONES[code.trim().toUpperCase()] ?? [] : [];
}

/** The country's main zone (its capital's), or null. */
export function primaryZone(code: string | null | undefined): string | null {
  return zonesForCountry(code)[0] ?? null;
}

/** ISO codes of the countries using a zone. */
export function countriesOfZone(zone: string): string[] {
  return byZone().get(canonicalZone(zone)) ?? [];
}

/** A zone that fits a newly picked country: keep the current one when it's already one of the country's. */
export function zoneForCountry(code: string | null | undefined, current: string | null | undefined): string | null {
  const zones = zonesForCountry(code);
  if (!zones.length) return null;
  const cur = canonicalZone(current);
  return zones.includes(cur) ? cur : zones[0];
}

/** Can the runtime use it (IANA name or alias)? */
export function isValidTimezone(zone: unknown): zone is string {
  if (typeof zone !== "string" || !zone.trim() || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone.trim() });
    return true;
  } catch {
    return false;
  }
}

/** Minutes ahead of UTC at a moment (DST-aware). */
export function zoneOffsetMinutes(zone: string, at: Date = new Date()): number {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(at).map((x) => [x.type, x.value]));
    const wall = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    return Math.round((wall - Math.floor(at.getTime() / 60_000) * 60_000) / 60_000);
  } catch {
    return 0;
  }
}

/** "GMT+4", "GMT+5:30", "GMT-3", "GMT". */
export function formatOffset(minutes: number): string {
  if (!minutes) return "GMT";
  const a = Math.abs(minutes);
  const h = Math.floor(a / 60);
  const m = a % 60;
  return `GMT${minutes < 0 ? "-" : "+"}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** The city part of a zone: "America/Argentina/Buenos_Aires" → "Buenos Aires". */
export function zoneCity(zone: string): string {
  const z = canonicalZone(zone);
  if (z === "UTC") return "UTC";
  return z.slice(z.lastIndexOf("/") + 1).replace(/_/g, " ");
}

/** "Asia/Muscat · GMT+4". */
export function zoneLabel(zone: string, at: Date = new Date()): string {
  return `${canonicalZone(zone)} · ${formatOffset(zoneOffsetMinutes(zone, at))}`;
}

/**
 * The zone a campus runs on: the main campus always follows the school (its own column is a stale copy), other
 * campuses use their own zone when set.
 */
export function campusZone(schoolZone: string | null | undefined, campus: { timezone?: string | null; is_main?: boolean | number | null } | null | undefined): string {
  const school = isValidTimezone(schoolZone) ? schoolZone : DEFAULT_TIMEZONE;
  if (!campus || Number(campus.is_main) === 1 || campus.is_main === true) return school;
  return isValidTimezone(campus.timezone) ? campus.timezone : school;
}

/** One zone shared by every given campus, else null (no campuses → null). */
export function sharedZone(zones: (string | null | undefined)[]): string | null {
  const set = new Set(zones.filter((z): z is string => !!z));
  return set.size === 1 ? [...set][0] : null;
}
