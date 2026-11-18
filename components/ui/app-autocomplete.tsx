"use client";

import { useTranslation } from "react-i18next";
import {
  Autocomplete,
  EmptyState,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import { FieldLabel } from "@/components/ui/filter-sheet-context";

export interface AppAutocompleteOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /** Extra text matched by the search filter (e.g. bilingual names). */
  searchText?: string;
}

/** HeroUI Autocomplete (searchable select) with a compact single-value string API. */
export function AppAutocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  isRequired,
  isDisabled,
  fullWidth = true,
  className,
  ariaLabel,
  variant = "secondary",
  clearable = true,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: AppAutocompleteOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
  /** Show the × button (off for fields that must always hold a value). */
  clearable?: boolean;
}) {
  const { t } = useTranslation();
  const { contains } = useFilter({ sensitivity: "base" });

  return (
    <Autocomplete
      className={className}
      fullWidth={fullWidth}
      variant={variant}
      isRequired={isRequired}
      isDisabled={isDisabled}
      selectionMode="single"
      placeholder={placeholder || "—"}
      aria-label={ariaLabel || label}
      value={value || null}
      onChange={(key: Key | Key[] | null) => onChange(key == null ? "" : String(key))}
    >
      <FieldLabel label={label} ariaLabel={ariaLabel} />
      <Autocomplete.Trigger >
        <Autocomplete.Value className="flex items-center flex-row gap-2" />
        {clearable && <Autocomplete.ClearButton />}
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary" className="sticky top-0 z-10">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={searchPlaceholder || t("common.search")} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            className="max-h-72 overflow-y-auto"
            renderEmptyState={() => <EmptyState>{t("common.noResults")}</EmptyState>}
          >
            {options.map((option) => (
              <ListBox.Item
                key={option.value}
                id={option.value}
                textValue={option.searchText || option.label}
              >
                {option.icon}
                {option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
