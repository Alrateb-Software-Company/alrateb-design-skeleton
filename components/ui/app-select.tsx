"use client";

import { useTranslation } from "react-i18next";
import { Autocomplete, Description, EmptyState, Header, ListBox, SearchField, Select } from "@heroui/react";
import type { Key } from "@heroui/react";
import type { SelectValueRenderProps } from "react-aria-components";
import { FieldLabel } from "@/components/ui/filter-sheet-context";

export interface AppSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  /** Colour dot shown before the description (e.g. a subject's curriculum). */
  descriptionColor?: string | null;
  /** Compact text shown in the trigger once selected (defaults to the label), e.g. "Chemistry · MOE". */
  selectedLabel?: string;
  /** Extra words matched by searchable pickers (e.g. the Arabic name, codes). */
  searchText?: string;
  /** Inline style for the option label (e.g. font previews). */
  style?: React.CSSProperties;
  /** Key of the `groups` entry this option is listed under (multi pickers). */
  group?: string;
}

/** A titled section of a multi picker's list. */
export interface AppSelectGroup { key: string; label: React.ReactNode }

/** Every whitespace-separated word of the query must appear somewhere in the option text (any order). */
export const containsFilter = (textValue: string, inputValue: string) => {
  const text = textValue.toLowerCase();
  return inputValue.toLowerCase().split(/\s+/).filter(Boolean).every((w) => text.includes(w));
};

/** Label with an optional muted description line underneath. */
export function OptionLabel({ option }: { option: AppSelectOption }) {
  const label = option.style ? <span style={option.style}>{option.label}</span> : option.label;
  if (!option.description) return <>{label}</>;
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{label}</span>
      <span className="flex min-w-0 items-center gap-1 text-xs text-neutral-500">
        {option.descriptionColor !== undefined && <span className="size-2 shrink-0 rounded-full" style={{ background: option.descriptionColor || "#94a3b8" }} />}
        <span className="truncate">{option.description}</span>
      </span>
    </span>
  );
}

export const textValueOf = (o: AppSelectOption) => [o.label, o.description, o.searchText].filter(Boolean).join(" ");
/** What a trigger shows for a selected option. */
export const selectedTextOf = (o: AppSelectOption) => o.selectedLabel || o.label;

/** Single-value trigger content: the compact `selectedLabel` when the option has one, else the rendered item. */
function singleValue(options: AppSelectOption[], value: string) {
  const sel = options.find((o) => o.value === value);
  const render = ({ isPlaceholder, defaultChildren }: { isPlaceholder: boolean; defaultChildren: React.ReactNode }) =>
    !isPlaceholder && sel?.selectedLabel ? <>{sel.icon}<span className="truncate">{sel.selectedLabel}</span></> : defaultChildren;
  return render;
}

/** Items of a multi picker; the trigger lists selections by `selectedTextOf`, descriptions show in the list only. */
function multiItems(options: AppSelectOption[], groups?: AppSelectGroup[]) {
  const item = (option: AppSelectOption) => (
    <ListBox.Item key={option.value} id={option.value} textValue={textValueOf(option)}>
      {option.icon}
      <OptionLabel option={option} />
      <ListBox.ItemIndicator />
    </ListBox.Item>
  );
  if (!groups?.length) return options.map(item);
  const known = new Set(groups.map((g) => g.key));
  const loose = options.filter((o) => !o.group || !known.has(o.group));
  return [
    ...groups.map((g) => {
      const items = options.filter((o) => o.group === g.key);
      return items.length ? (
        <ListBox.Section key={`g-${g.key}`}>
          <Header>{g.label}</Header>
          {items.map(item)}
        </ListBox.Section>
      ) : null;
    }),
    ...loose.map(item),
  ];
}

/**
 * Multi-value trigger text. react-aria would join with the *browser* locale's "and"
 * (no I18nProvider in the app), so join with a comma in the UI language instead.
 */
function useMultiValueText(options: AppSelectOption[]) {
  const { i18n } = useTranslation();
  const sep = i18n.language?.startsWith("ar") ? "، " : ", ";
  return ({ state, isPlaceholder, defaultChildren }: SelectValueRenderProps<unknown> & { defaultChildren: React.ReactNode }) => {
    if (isPlaceholder) return defaultChildren;
    const byKey = new Map(options.map((o) => [o.value, o]));
    return state.selectedItems.map((i) => { const o = byKey.get(String(i.key)); return o ? selectedTextOf(o) : i.textValue; }).filter(Boolean).join(sep);
  };
}

// An empty value renders as "no selection", so an explicit "" option (e.g. "All grades") doubles as the placeholder.
const placeholderOf = (placeholder: string | undefined, options: AppSelectOption[]) =>
  placeholder || options.find((o) => o.value === "")?.label || "—";

/** HeroUI Select with a compact single-value string API. */
export function AppSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  isRequired,
  isDisabled,
  fullWidth = true,
  className,
  ariaLabel,
  variant = "secondary",
  description,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
  /** Help text under the field. */
  description?: string;
}) {
  return (
    <Select
      className={className}
      fullWidth={fullWidth}
      variant={variant}
      isRequired={isRequired}
      isDisabled={isDisabled}
      placeholder={placeholderOf(placeholder, options)}
      aria-label={ariaLabel || label}
      value={value || null}
      onChange={(key: Key | Key[] | null) => onChange(key == null ? "" : String(key))}
    >
      <FieldLabel label={label} ariaLabel={ariaLabel} />
      <Select.Trigger>
        <Select.Value className={'flex min-w-0 items-center gap-1'}>{singleValue(options, value)}</Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="max-h-72 overflow-y-auto">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={textValueOf(option)}>
              {option.icon}
              <OptionLabel option={option} />
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
      {description && <Description>{description}</Description>}
    </Select>
  );
}

/** HeroUI Autocomplete (searchable select) with a single-value string API. */
export function AppAutocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  isRequired,
  isDisabled,
  isClearable = true,
  fullWidth = true,
  className,
  ariaLabel,
  variant = "secondary",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Show the clear (×) button; turn off when the value is already the default. */
  isClearable?: boolean;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
}) {
  const { t } = useTranslation();
  return (
    <Autocomplete
      className={className}
      fullWidth={fullWidth}
      variant={variant}
      isRequired={isRequired}
      isDisabled={isDisabled}
      placeholder={placeholderOf(placeholder, options)}
      aria-label={ariaLabel || label}
      value={value || null}
      onChange={(key: Key | Key[] | null) => onChange(key == null ? "" : String(key))}
    >
      <FieldLabel label={label} ariaLabel={ariaLabel} />
      <Autocomplete.Trigger>
        <Autocomplete.Value className={'flex items-center gap-1'}>{singleValue(options, value)}</Autocomplete.Value>
        {isClearable && <Autocomplete.ClearButton />}
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={containsFilter}>
          <SearchField variant="secondary" autoFocus aria-label={ariaLabel || label}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={searchPlaceholder} />
            </SearchField.Group>
          </SearchField>
          <ListBox className="max-h-64 overflow-y-auto" renderEmptyState={() => <EmptyState>{t("common.noResults")}</EmptyState>}>
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

/** HeroUI Autocomplete in multiple-selection mode with a string-array API. */
export function AppMultiAutocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  isDisabled,
  fullWidth = true,
  className,
  ariaLabel,
  variant = "secondary",
  groups,
}: {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: AppSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
  groups?: AppSelectGroup[];
}) {
  const valueText = useMultiValueText(options);
  return (
    <Autocomplete
      selectionMode="multiple"
      className={className}
      fullWidth={fullWidth}
      variant={variant}
      isDisabled={isDisabled}
      placeholder={placeholder || "—"}
      aria-label={ariaLabel || label}
      value={value}
      onChange={(keys: Key[]) => onChange(keys.map(String))}
    >
      <FieldLabel label={label} ariaLabel={ariaLabel} />
      <Autocomplete.Trigger>
        <Autocomplete.Value>{valueText}</Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={containsFilter}>
          <SearchField variant="secondary" autoFocus aria-label={ariaLabel || label}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={searchPlaceholder} />
            </SearchField.Group>
          </SearchField>
          <ListBox className="max-h-64 overflow-y-auto">
            {multiItems(options, groups)}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

/** HeroUI Select in multiple-selection mode with a string-array API. */
export function AppMultiSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  isDisabled,
  fullWidth = true,
  className,
  ariaLabel,
  variant = "secondary",
  groups,
}: {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: AppSelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
  groups?: AppSelectGroup[];
}) {
  const valueText = useMultiValueText(options);
  return (
    <Select
      selectionMode="multiple"
      className={className}
      fullWidth={fullWidth}
      variant={variant}
      isDisabled={isDisabled}
      placeholder={placeholder || "—"}
      aria-label={ariaLabel || label}
      value={value}
      onChange={(keys: Key[]) => onChange(keys.map(String))}
    >
      <FieldLabel label={label} ariaLabel={ariaLabel} />
      <Select.Trigger>
        <Select.Value>{valueText}</Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="max-h-72 overflow-y-auto">
        <ListBox>
          {multiItems(options, groups)}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
