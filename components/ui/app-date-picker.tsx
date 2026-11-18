"use client";

import { Button, Calendar, DateField, DatePicker, TimeField } from "@heroui/react";
import { parseDate, parseDateTime, parseTime, type DateValue, type Time } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import { Clock, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldLabel } from "@/components/ui/filter-sheet-context";

// Node's ICU puts a narrow no-break space before AM/PM while browsers use a
// plain space, which breaks hydration. Normalise literal segments.
function seg<S extends { type: string; text: string }>(segment: S): S {
  return segment.type === "literal" ? { ...segment, text: segment.text.replace(/[\u202f\u00a0]/g, " ") } : segment;
}

function toTimeValue(value: string): Time | null {
  if (!value) return null;
  try {
    return parseTime(value.slice(0, 8));
  } catch {
    return null;
  }
}

/** HeroUI TimeField with a compact "HH:MM" (24h) string API; shown as 12h segments. */
export function AppTimePicker({
  label,
  value,
  onChange,
  isRequired,
  isDisabled,
  isClearable,
  className,
  ariaLabel,
  variant = "secondary",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
}) {
  const { t } = useTranslation();
  const showClear = isClearable && !isDisabled && !!value;
  return (
    <I18nProvider locale="en-IN">
      <TimeField
        className={className || "w-full"}
        isRequired={isRequired}
        isDisabled={isDisabled}
        aria-label={ariaLabel || label}
        hourCycle={12}
        granularity="minute"
        value={toTimeValue(value)}
        onChange={(time) => onChange(time ? `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}` : "")}
      >
        <FieldLabel label={label} ariaLabel={ariaLabel} />
        <TimeField.Group fullWidth variant={variant}>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={seg(segment)} />}</TimeField.Input>
          <TimeField.Suffix className="flex items-center gap-1">
            {showClear ? (
              <Button isIconOnly size="sm" variant="ghost" aria-label={t("common.clear")} className="size-6 min-w-0 rounded-full text-neutral-400" onPress={() => onChange("")}>
                <X className="size-3.5" />
              </Button>
            ) : null}
            <Clock className="size-4 text-neutral-400" />
          </TimeField.Suffix>
        </TimeField.Group>
      </TimeField>
    </I18nProvider>
  );
}

function toDateValue(value: string): DateValue | null {
  if (!value) return null;
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

function toDateTimeValue(value: string): DateValue | null {
  if (!value) return null;
  try {
    // Accept "YYYY-MM-DD", "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD HH:mm[:ss]".
    const v = value.replace(" ", "T").slice(0, 19);
    return v.length > 10 ? parseDateTime(v) : parseDateTime(`${v}T00:00`);
  } catch {
    return null;
  }
}

/** Calendar body shared by the date / date-time pickers. */
function CalendarBody({ label }: { label?: string }) {
  return (
    <Calendar aria-label={label || "Date"}>
      <Calendar.Header>
        <Calendar.YearPickerTrigger>
          <Calendar.YearPickerTriggerHeading />
          <Calendar.YearPickerTriggerIndicator />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
      <Calendar.YearPickerGrid>
        <Calendar.YearPickerGridBody>{({ year }) => <Calendar.YearPickerCell year={year} />}</Calendar.YearPickerGridBody>
      </Calendar.YearPickerGrid>
    </Calendar>
  );
}

/**
 * HeroUI DatePicker with minute granularity and a "YYYY-MM-DDTHH:mm" string API
 * (local time, no zone). Used wherever a payment / event timestamp is entered.
 */
export function AppDateTimePicker({
  label,
  value,
  onChange,
  isRequired,
  isDisabled,
  className,
  ariaLabel,
  variant = "secondary",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <I18nProvider locale="en-IN">
      <DatePicker
        className={className || "w-full"}
        isRequired={isRequired}
        isDisabled={isDisabled}
        aria-label={ariaLabel || label}
        granularity="minute"
        hourCycle={12}
        value={toDateTimeValue(value)}
        onChange={(date) => onChange(date ? date.toString().slice(0, 16) : "")}
      >
        <FieldLabel label={label} ariaLabel={ariaLabel} />
        <DateField.Group fullWidth variant={variant}>
          <DateField.Input>{(segment) => <DateField.Segment segment={seg(segment)} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <CalendarBody label={label} />
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  );
}

/** HeroUI DatePicker with a compact "YYYY-MM-DD" string API. */
export function AppDatePicker({
  label,
  value,
  onChange,
  isRequired,
  isDisabled,
  isClearable,
  className,
  ariaLabel,
  variant = "secondary",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Shows an X button inside the field when a date is set. */
  isClearable?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
}) {
  const { t } = useTranslation();
  const showClear = isClearable && !isDisabled && !!value;
  return (
    <I18nProvider locale="en-IN">
      <DatePicker
        className={className || "w-full"}
        isRequired={isRequired}
        isDisabled={isDisabled}
        aria-label={ariaLabel || label}
        value={toDateValue(value)}
        onChange={(date) => onChange(date ? date.toString().slice(0, 10) : "")}
      >
        <FieldLabel label={label} ariaLabel={ariaLabel} />
        <DateField.Group fullWidth variant={variant}>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix className="flex items-center gap-1">
            {showClear && (
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={t("common.clear")}
                className="size-6 min-w-0 rounded-full text-neutral-400"
                onPress={() => onChange("")}
              >
                <X className="size-3.5" />
              </Button>
            )}
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label={label || "Date"}>
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>

  );
}
