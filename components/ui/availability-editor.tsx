"use client";

import { useTranslation } from "react-i18next";
import { Button, Switch } from "@heroui/react";
import { Copy } from "lucide-react";
import { AppTimePicker } from "@/components/ui/app-date-picker";
import { WEEKDAYS, toMinutes, type Availability, type DayHours } from "@/config/availability";

/** Weekday name in the UI language (2023-01-01 was a Sunday). */
export function weekdayName(day: number, locale: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { weekday: style, timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + day)));
}

export const validDayHours = (d: DayHours) => !!d.from && !!d.to && toMinutes(d.from) < toMinutes(d.to);

/**
 * One row per weekday: on/off and from–to. Used for a staff member's chat
 * availability (Profile) and the school's default working hours (Chat settings).
 */
export function AvailabilityEditor({ value, onChange, isDisabled }: { value: Availability; onChange: (next: Availability) => void; isDisabled?: boolean }) {
  const { t, i18n } = useTranslation();
  const byDay = new Map(value.days.map((d) => [d.day, d]));
  const set = (day: number, patch: Partial<DayHours> | null) => {
    const rest = value.days.filter((d) => d.day !== day);
    const cur = byDay.get(day) ?? { day, from: "07:30", to: "14:30" };
    onChange({ ...value, days: patch === null ? rest : [...rest, { ...cur, ...patch }].sort((a, b) => a.day - b.day) });
  };
  const copyToAll = (src: DayHours) => onChange({ ...value, days: value.days.map((d) => ({ ...d, from: src.from, to: src.to })) });

  return (
    <ul className="divide-y divide-app-border rounded-xl border border-app-border">
      {WEEKDAYS.map((day) => {
        const h = byDay.get(day);
        const bad = h && !validDayHours(h);
        return (
          <li key={day} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-36 items-center gap-3">
              <Switch isSelected={!!h} isDisabled={isDisabled} onChange={(v) => set(day, v ? {} : null)} aria-label={weekdayName(day, i18n.language)} size="sm">
                <Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch.Content>
              </Switch>
              <span className={`text-sm ${h ? "font-medium" : "text-neutral-400"}`}>{weekdayName(day, i18n.language)}</span>
            </div>
            {h ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <AppTimePicker className="w-32" ariaLabel={t("availability.from")} value={h.from} onChange={(v) => v && set(day, { from: v })} isDisabled={isDisabled} />
                <span className="text-xs text-neutral-400">–</span>
                <AppTimePicker className="w-32" ariaLabel={t("availability.to")} value={h.to} onChange={(v) => v && set(day, { to: v })} isDisabled={isDisabled} />
                {!isDisabled && value.days.length > 1 && (
                  <Button size="sm" variant="ghost" isIconOnly aria-label={t("availability.copyToAll")} onPress={() => copyToAll(h)}><Copy className="size-3.5" /></Button>
                )}
                {bad && <span className="text-xs text-danger">{t("availability.invalid")}</span>}
              </div>
            ) : (
              <span className="text-xs text-neutral-400">{t("availability.off")}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
