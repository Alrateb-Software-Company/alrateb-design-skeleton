"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { countryByCode, countryLabel, flagUrl } from "@/lib/countries-data";
import { allTimezones, canonicalZone, countriesOfZone, formatOffset, zoneCity, zoneOffsetMinutes, zonesForCountry } from "@/config/timezones";

const INHERIT = "__inherit__";

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => 0;

/** "14:05" style local time in a zone, in the UI language. */
function localTime(zone: string, lang: string, at: Date): string {
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : "en", { timeZone: zone, hour: "numeric", minute: "2-digit", weekday: "short" }).format(at);
  } catch {
    return "";
  }
}

/**
 * Searchable list of every time zone ("City, Country (GMT+4)"), the given country's zones first. Search matches
 * the city, the zone id, the country in English / Arabic and the offset. `inherit` adds a "same as …" choice that
 * maps to an empty value (a campus following the school).
 */
export function TimezoneSelect({
  label,
  value,
  onChange,
  country,
  inherit,
  isRequired,
  isDisabled,
  hint,
  variant = "secondary",
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** ISO code whose zones are listed first. */
  country?: string | null;
  /** Offer "Same as the school (zone)": picking it sends "". */
  inherit?: string | null;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Shown under the field instead of the local time. */
  hint?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  // Offsets and the local-time line follow a once-a-minute clock (DST-aware; 0 on the server avoids a hydration mismatch).
  const minute = useSyncExternalStore(subscribeMinute, currentMinute, serverMinute);
  const now = minute ? new Date(minute * 60_000) : null;

  const options = useMemo(() => {
    const at = minute ? new Date(minute * 60_000) : new Date(0);
    const home = (country ?? "").toUpperCase();
    const first = new Set(zonesForCountry(home));
    const current = canonicalZone(value);
    const zones = allTimezones().includes(current) || !current ? allTimezones() : [current, ...allTimezones()];
    const rows = zones.map((zone) => {
      const codes = countriesOfZone(zone);
      const code = codes.includes(home) ? home : codes[0];
      const c = code ? countryByCode(code) : null;
      const offset = zoneOffsetMinutes(zone, at);
      const city = zoneCity(zone);
      // Arabic: isolate the Latin city / offset so the bidi algorithm keeps "City، Country (GMT+4)" in order.
      const ar = lang === "ar";
      const place = c && countryLabel(c, lang) !== city ? (ar ? `\u2068${city}\u2069، ${countryLabel(c, lang)}` : `${city}, ${countryLabel(c, lang)}`) : ar ? `\u2068${city}\u2069` : city;
      const off = ar ? `\u2066${formatOffset(offset)}\u2069` : formatOffset(offset);
      return {
        zone, offset, first: first.has(zone),
        option: {
          value: zone,
          label: `${place} (${off})`,
          searchText: [place, zone, zone.replace(/_/g, " "), formatOffset(offset), ...codes.flatMap((x) => {
            const cc = countryByCode(x);
            return cc ? [cc.name, cc.name_ar, cc.name_ar?.replace(/[\u064B-\u0652\u0670]/g, ""), x] : [x];
          })].filter(Boolean).join(" "),
          icon: code ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={flagUrl(code)} alt="" className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover" loading="lazy" />
          ) : <Clock className="size-3.5 shrink-0 text-neutral-400" />,
        },
      };
    });
    // The country's main zone first, then its other zones, then the world (each by offset, then city).
    const main = zonesForCountry(home)[0];
    const rank = (r: (typeof rows)[number]) => (r.zone === main ? 0 : r.first ? 1 : 2);
    rows.sort((a, b) => rank(a) - rank(b) || a.offset - b.offset || a.option.label.localeCompare(b.option.label));
    const list = rows.map((r) => r.option);
    if (inherit) {
      const off = formatOffset(zoneOffsetMinutes(inherit, at));
      const zone = lang === "ar" ? `\u2068${zoneCity(inherit)}\u2069 (\u2066${off}\u2069)` : `${zoneCity(inherit)} (${off})`;
      list.unshift({ value: INHERIT, label: t("timezones.sameAsSchool", { zone }), searchText: `${t("timezones.sameAsSchool", { zone: inherit })} ${inherit}`, icon: <Clock className="size-3.5 shrink-0 text-neutral-400" /> });
    }
    return list;
  }, [country, value, inherit, lang, minute, t]);

  const effective = value || inherit || "";
  const time = now && effective ? localTime(effective, lang, now) : "";
  const note = hint ?? (time ? t("timezones.localNow", { time }) : "");

  return (
    <div className={className}>
      <AppAutocomplete
        label={label}
        value={value ? canonicalZone(value) : inherit ? INHERIT : ""}
        onChange={(v) => onChange(v === INHERIT ? "" : v)}
        options={options}
        isRequired={isRequired}
        isDisabled={isDisabled}
        placeholder={t("timezones.placeholder")}
        searchPlaceholder={t("timezones.search")}
        variant={variant}
        clearable={!isRequired && !inherit}
      />
      {note && <p className="mt-1 text-xs text-neutral-500">{note}</p>}
    </div>
  );
}
