"use client";

import { useTranslation } from "react-i18next";
import { Chip, Input, Label, TextField } from "@heroui/react";
import { AppSelect } from "@/components/ui/app-select";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { RECURRENCE_FREQS, type Recurrence } from "@/lib/recurrence";

export const DEFAULT_RECURRENCE: Recurrence = { freq: "monthly", interval: 1, byMonthDay: 1 };

/**
 * Form control for the shared JSON recurrence rule (service schedules, task
 * series, recurring expenses, recurring fee templates). Keeps the rule valid
 * for `recurrenceSchema` as the user switches frequencies.
 */
export function RecurrenceField({ value, onChange, isDisabled, showEnd = true }: { value: Recurrence; onChange: (v: Recurrence) => void; isDisabled?: boolean; showEnd?: boolean }) {
  const { t } = useTranslation();
  const up = (patch: Partial<Recurrence>) => onChange({ ...value, ...patch });
  const setFreq = (freq: Recurrence["freq"]) => {
    const base: Recurrence = { freq, interval: value.interval || 1, until: value.until ?? null, count: value.count ?? null };
    if (freq === "weekly") base.byWeekDay = value.byWeekDay?.length ? value.byWeekDay : [1];
    if (freq === "monthly" || freq === "quarterly") base.byMonthDay = value.byMonthDay ?? 1;
    if (freq === "yearly") { base.byMonthDay = value.byMonthDay ?? 1; base.byMonth = value.byMonth ?? 1; }
    onChange(base);
  };
  const days = [0, 1, 2, 3, 4, 5, 6];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <AppSelect label={t("recurrence.freq")} value={value.freq} onChange={(v) => setFreq(v as Recurrence["freq"])} isDisabled={isDisabled} options={RECURRENCE_FREQS.map((f) => ({ value: f, label: t(`recurrence.freqs.${f}`) }))} />
        <TextField variant="secondary" type="number" value={String(value.interval ?? 1)} onChange={(v) => up({ interval: Math.max(1, Math.min(365, Number(v) || 1)) })} isDisabled={isDisabled}>
          <Label>{t("recurrence.interval", { unit: t(`recurrence.units.${value.freq}`) })}</Label>
          <Input min={1} max={365} />
        </TextField>
      </div>
      {value.freq === "weekly" && (
        <div>
          <p className="mb-1 text-xs text-neutral-500">{t("recurrence.onDays")}</p>
          <div className="flex flex-wrap gap-1">
            {days.map((d) => {
              const on = value.byWeekDay?.includes(d) ?? false;
              return (
                <Chip key={d} size="sm" variant={on ? "primary" : "soft"} className={isDisabled ? "" : "cursor-pointer"} onClick={() => { if (isDisabled) return; const next = on ? (value.byWeekDay ?? []).filter((x) => x !== d) : [...(value.byWeekDay ?? []), d].sort(); up({ byWeekDay: next.length ? next : [d] }); }}>
                  <Chip.Label>{t(`recurrence.weekdays.${d}`)}</Chip.Label>
                </Chip>
              );
            })}
          </div>
        </div>
      )}
      {(value.freq === "monthly" || value.freq === "quarterly" || value.freq === "yearly") && (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.freq === "yearly" && <AppSelect label={t("recurrence.month")} value={String(value.byMonth ?? 1)} onChange={(v) => up({ byMonth: Number(v) })} isDisabled={isDisabled} options={months.map((m) => ({ value: String(m), label: t(`recurrence.months.${m}`) }))} />}
          <TextField variant="secondary" type="number" value={String(value.byMonthDay ?? 1)} onChange={(v) => up({ byMonthDay: Math.max(1, Math.min(31, Number(v) || 1)) })} isDisabled={isDisabled}>
            <Label>{t("recurrence.dayOfMonth")}</Label>
            <Input min={1} max={31} />
          </TextField>
        </div>
      )}
      {showEnd && (
        <div className="grid gap-3 sm:grid-cols-2">
          <AppDatePicker label={t("recurrence.until")} value={value.until ?? ""} onChange={(v) => up({ until: v || null })} isDisabled={isDisabled} />
          <TextField variant="secondary" type="number" value={value.count ? String(value.count) : ""} onChange={(v) => up({ count: v ? Math.max(1, Number(v) || 1) : null })} isDisabled={isDisabled}>
            <Label>{t("recurrence.count")}</Label>
            <Input min={1} placeholder={t("recurrence.unlimited")} />
          </TextField>
        </div>
      )}
    </div>
  );
}

/** Human-readable rule summary (client-side, translated). */
export function useRecurrenceLabel() {
  const { t } = useTranslation();
  return (r: Recurrence | null | undefined): string => {
    if (!r) return "—";
    const every = r.interval > 1 ? t("recurrence.everyN", { n: r.interval, unit: t(`recurrence.unitsPlural.${r.freq}`) }) : t(`recurrence.every.${r.freq}`);
    let detail = "";
    if (r.freq === "weekly" && r.byWeekDay?.length) detail = ` · ${r.byWeekDay.map((d) => t(`recurrence.weekdays.${d}`)).join(", ")}`;
    else if (r.freq === "yearly" && r.byMonth) detail = ` · ${t(`recurrence.months.${r.byMonth}`)} ${r.byMonthDay ?? 1}`;
    else if (r.byMonthDay && r.freq !== "daily") detail = ` · ${t("recurrence.day", { n: r.byMonthDay })}`;
    return every + detail;
  };
}
