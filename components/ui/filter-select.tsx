"use client";

import { Autocomplete, ListBox, SearchField, Select, type Key } from "@heroui/react";
import { AppSelect, OptionLabel, containsFilter, selectedTextOf, textValueOf, type AppSelectOption } from "@/components/ui/app-select";
import { useTranslation } from "react-i18next";
import { FieldLabel, useInFilterSheet } from "@/components/ui/filter-sheet-context";

const ALL = "__all__";

/** Trigger text of a multi filter: its label (or "All" under a visible label in the filter sheet), the one pick, or "Label · n". */
function useMultiSummary(label: string, selected: AppSelectOption[]) {
  const sheet = useInFilterSheet();
  const { t } = useTranslation();
  if (selected.length === 0) return sheet ? t("common.all") : label;
  return selected.length === 1 ? selectedTextOf(selected[0]) : `${label} · ${selected.length}`;
}

/**
 * Single-choice list filter (sort order, yes/no toggles). An empty value means
 * "all" and shows `allLabel` instead of a blank placeholder (HeroUI Select
 * cannot hold an empty-string key). Prefer `FilterMultiSelect` for anything
 * that can sensibly match several values.
 */
export function FilterSelect({ value, onChange, allLabel, options, ariaLabel, label, className }: { value: string; onChange: (value: string) => void; allLabel: string; options: AppSelectOption[]; ariaLabel: string; label?: string; className?: string }) {
  return (
    <AppSelect
      ariaLabel={ariaLabel}
      label={label}
      className={className}
      value={value || ALL}
      onChange={(v) => onChange(v === ALL ? "" : v)}
      options={[{ value: ALL, label: allLabel }, ...options]}
    />
  );
}

/**
 * Single-choice filter backed by a searchable Autocomplete — for lookups that
 * can grow large (staff, vendors, contacts). Empty value means "all" and the
 * trigger shows `allLabel`; the clear button resets to all.
 */
export function FilterAutocomplete({
  value,
  onChange,
  allLabel,
  options,
  ariaLabel,
  label,
  className,
  isDisabled,
}: {
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: AppSelectOption[];
  ariaLabel: string;
  label?: string;
  className?: string;
  isDisabled?: boolean;
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <Autocomplete
      className={className}
      variant="secondary"
      isDisabled={isDisabled}
      placeholder={allLabel}
      aria-label={ariaLabel}
      value={value || null}
      onChange={(key: Key | Key[] | null) => onChange(key == null ? "" : String(key))}
    >
      <FieldLabel label={label} ariaLabel={ariaLabel} />
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {() => <span className={`min-w-0 truncate ${selected ? "font-medium" : "text-neutral-500"}`} title={selected ? selectedTextOf(selected) : undefined}>{selected ? selectedTextOf(selected) : allLabel}</span>}
        </Autocomplete.Value>
        {selected && <Autocomplete.ClearButton />}
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={containsFilter}>
          <SearchField variant="secondary" autoFocus aria-label={ariaLabel}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input />
            </SearchField.Group>
          </SearchField>
          <ListBox className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <ListBox.Item key={option.value} id={option.value} textValue={textValueOf(option)}>
                {option.icon}
                <OptionLabel option={option} />
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

/**
 * Multi-choice list filter backed by a searchable Autocomplete — for lookups
 * that can grow large (students, guardians, staff). Same labelled trigger
 * contract as `FilterMultiSelect`.
 */
export function FilterMultiAutocomplete({
  label,
  value,
  onChange,
  options,
  className,
  isDisabled,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: AppSelectOption[];
  className?: string;
  isDisabled?: boolean;
}) {
  const selected = options.filter((o) => value.includes(o.value));
  const summary = useMultiSummary(label, selected);
  return (
    <Autocomplete
      selectionMode="multiple"
      className={className}
      variant="secondary"
      isDisabled={isDisabled}
      placeholder={label}
      aria-label={label}
      value={value}
      onChange={(keys: Key[]) => onChange(keys.map(String))}
    >
      <FieldLabel ariaLabel={label} />
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {() => <span className={selected.length === 0 ? "text-neutral-500" : "font-medium"}>{summary}</span>}
        </Autocomplete.Value>
        {selected.length > 0 && <Autocomplete.ClearButton />}
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={containsFilter}>
          <SearchField variant="secondary" autoFocus aria-label={label}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input />
            </SearchField.Group>
          </SearchField>
          <ListBox className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <ListBox.Item key={option.value} id={option.value} textValue={textValueOf(option)}>
                {option.icon}
                <OptionLabel option={option} />
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

/**
 * Multi-choice list filter. The trigger always says what it filters:
 * `label` when nothing is selected ("Type"), the option label for one
 * selection, and "Type · 3" for several.
 */
export function FilterMultiSelect({
  label,
  value,
  onChange,
  options,
  className,
  isDisabled,
  showLabel,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: AppSelectOption[];
  className?: string;
  isDisabled?: boolean;
  /** Render a visible label above the control (dense toolbars rely on the placeholder instead). */
  showLabel?: boolean;
}) {
  const selected = options.filter((o) => value.includes(o.value));
  const summary = useMultiSummary(label, selected);
  return (
    <Select
      selectionMode="multiple"
      className={className}
      variant="secondary"
      isDisabled={isDisabled}
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={(keys: Key[]) => onChange(keys.map(String))}
    >
      <FieldLabel label={showLabel ? label : undefined} ariaLabel={label} />
      <Select.Trigger>
        <Select.Value>
          {() => <span className={selected.length === 0 ? "text-neutral-500" : "font-medium"}>{summary}</span>}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="max-h-72 overflow-y-auto">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.icon}
              <OptionLabel option={option} />
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
