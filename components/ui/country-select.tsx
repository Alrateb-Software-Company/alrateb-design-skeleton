"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import {
  countries,
  countryLabel,
  currencyLabel,
  currencyOptions,
  flagUrl,
} from "@/lib/countries-data";

/** Searchable country dropdown with flags and bilingual names (alrateb countries dataset). */
export function CountrySelect({
  label,
  value,
  onChange,
  isRequired,
  isDisabled,
  placeholder,
  variant = "secondary",
  valueMode = "name",
  exclude,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  variant?: "primary" | "secondary";
  /** What `value` holds: the English name (default, legacy forms) or the ISO alpha-2 code. */
  valueMode?: "name" | "code";
  /** ISO codes to hide (e.g. countries already configured). */
  exclude?: string[];
}) {
  const { i18n } = useTranslation();

  const options = useMemo(() => {
    const hidden = new Set((exclude ?? []).map((c) => c.toUpperCase()));
    return countries
      .filter((country) => !hidden.has(country.code.toUpperCase()) || country.code === value)
      .map((country) => ({
        // Legacy forms store the English name for readability/searchability.
        value: valueMode === "code" ? country.code : country.name,
        label: countryLabel(country, i18n.language),
        searchText: [country.name, country.name_ar, country.name_ar?.replace(/[\u064B-\u0652\u0670]/g, ""), country.code].filter(Boolean).join(" "),
        icon: (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flagUrl(country.code)}
            alt=""
            className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover"
            loading="lazy"
          />
        ),
      }));
  }, [i18n.language, valueMode, exclude, value]);

  return (
    <AppAutocomplete
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      isRequired={isRequired}
      isDisabled={isDisabled}
      placeholder={placeholder}
      variant={variant}
    />
  );
}

/** Searchable currency dropdown (unique currencies from the countries dataset). */
export function CurrencySelect({
  label,
  value,
  onChange,
  isRequired,
  isDisabled,
  placeholder,
  variant = "secondary",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  variant?: "primary" | "secondary";
}) {
  const { i18n } = useTranslation();

  const options = useMemo(
    () =>
      currencyOptions.map((option) => ({
        value: option.code,
        label: currencyLabel(option, i18n.language),
        searchText: `${option.code} ${option.name} ${option.name_ar} ${option.symbol_ar}`,
      })),
    [i18n.language]
  );

  return (
    <AppAutocomplete
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      isRequired={isRequired}
      isDisabled={isDisabled}
      placeholder={placeholder}
      variant={variant}
    />
  );
}
