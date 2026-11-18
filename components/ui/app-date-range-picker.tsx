"use client";

import { Button, DateField, DateRangePicker, RangeCalendar } from "@heroui/react";
import { parseDate, type DateValue } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldLabel } from "@/components/ui/filter-sheet-context";

export interface DateRangeValue {
  from: string;
  to: string;
}

function toDateValue(value: string): DateValue | null {
  if (!value) return null;
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

function toRangeValue(value: DateRangeValue): { start: DateValue; end: DateValue } | null {
  const start = toDateValue(value.from);
  const end = toDateValue(value.to);
  return start && end ? { start, end } : null;
}

/** HeroUI DateRangePicker with a compact "YYYY-MM-DD" from/to string API. */
export function AppDateRangePicker({
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
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Shows an X button inside the field when a range is set. */
  isClearable?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
}) {
  const { t } = useTranslation();
  const showClear = isClearable && !isDisabled && !!(value.from || value.to);
  return (
    <I18nProvider locale="en-IN">
      <DateRangePicker
        className={className || "w-full"}
        isRequired={isRequired}
        isDisabled={isDisabled}
        aria-label={ariaLabel || label}
        value={toRangeValue(value)}
        onChange={(range) =>
          onChange(
            range
              ? {
                from: range.start.toString().slice(0, 10),
                to: range.end.toString().slice(0, 10),
              }
              : { from: "", to: "" }
          )
        }
      >
        <FieldLabel label={label} ariaLabel={ariaLabel} />
        <DateField.Group fullWidth variant={variant}>
           <DateField.Prefix className="flex items-center gap-1">
            {showClear && (
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={t("common.clear")}
                className="size-6 min-w-0 rounded-full text-neutral-400"
                onPress={() => onChange({ from: "", to: "" })}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </DateField.Prefix>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix className="flex items-center gap-1">
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DateRangePicker.Popover>
          <RangeCalendar aria-label={ariaLabel || label || "Date range"}>
            <RangeCalendar.Header>
              <RangeCalendar.YearPickerTrigger>
                <RangeCalendar.YearPickerTriggerHeading />
                <RangeCalendar.YearPickerTriggerIndicator />
              </RangeCalendar.YearPickerTrigger>
              <RangeCalendar.NavButton slot="previous" />
              <RangeCalendar.NavButton slot="next" />
            </RangeCalendar.Header>
            <RangeCalendar.Grid>
              <RangeCalendar.GridHeader>
                {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
              </RangeCalendar.GridHeader>
              <RangeCalendar.GridBody>
                {(date) => <RangeCalendar.Cell date={date} />}
              </RangeCalendar.GridBody>
            </RangeCalendar.Grid>
            <RangeCalendar.YearPickerGrid>
              <RangeCalendar.YearPickerGridBody>
                {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
              </RangeCalendar.YearPickerGridBody>
            </RangeCalendar.YearPickerGrid>
          </RangeCalendar>
        </DateRangePicker.Popover>
      </DateRangePicker>
    </I18nProvider>

  );
}
