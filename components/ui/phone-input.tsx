"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  InputGroup,
  Label,
  Popover,
  SearchField,
  TextField,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { countries, countryDialCodes } from "@/lib/countries.js";
import { APP_DEFAULTS } from "@/config/app";

// International phone input with a searchable country dial-code picker
// (alrateb PhoneNumberInput pattern, rebuilt on HeroUI v3).
// `value` is the full international number ("+96477012345"); the field
// displays only the national digits.

interface CountryDialInfo {
  code: string;
  name: string;
  localizedName: string;
  image?: string;
  dialCodes: string[];
}

interface RawDialCountry {
  code: string;
  name: string;
  image?: string;
  dialCodes?: string[];
}

const AR_NAMES = new Map(
  (countries as { code: string; name_ar?: string }[]).map((c) => [c.code, c.name_ar])
);

const extractDigits = (value: string) => value.replace(/[^0-9]/g, "");

function getNationalDigits(phone: string, country?: CountryDialInfo | null): string {
  if (!phone) return "";
  const sanitized = phone.replace(/\s+/g, "");
  for (const dial of country?.dialCodes || []) {
    if (sanitized.startsWith(dial)) return extractDigits(sanitized.slice(dial.length));
  }
  return extractDigits(sanitized.startsWith("+") ? sanitized.slice(1) : sanitized);
}

function composeInternationalNumber(digits: string, country?: CountryDialInfo | null): string {
  if (!digits) return "";
  const dial = country?.dialCodes?.[0] || "";
  return dial ? `${dial}${digits}` : `+${digits}`;
}

/** Leading dial code ("+968") for an ISO country, or "" when unknown. */
export function dialCodeForCountry(code: string | null | undefined): string {
  if (!code) return "";
  const c = (countryDialCodes as RawDialCountry[]).find((x) => x.code === code.toUpperCase());
  return c?.dialCodes?.[0] || "";
}

/** Longest known dial code that prefixes an international number ("+44…" → "+44"), or null. */
export function matchDialCode(intl: string): string | null {
  if (!intl.startsWith("+")) return null;
  let best: string | null = null;
  for (const c of countryDialCodes as RawDialCountry[]) {
    for (const d of c.dialCodes || []) {
      if (intl.startsWith(d) && (!best || d.length > best.length)) best = d;
    }
  }
  return best;
}

/** Chars a phone field tolerates while typing (digits, spaces, +, separators). */
const PHONE_CHARS = /^[\d\s()+\-.]*$/;

export function PhoneInput({
  label,
  value,
  onChange,
  placeholder,
  isRequired,
  isDisabled,
  defaultCountry,
  className,
  inputClassName,
  variant = "secondary",
  autoFocus,
  onTextInput,
  isInvalid,
  ariaLabel,
}: {
  label?: string;
  inputClassName?: string;
  isInvalid?: boolean;
  /** Accessible name when the visible label is rendered outside the field. */
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** ISO code; defaults to APP_DEFAULTS.countryCode (config/app.ts). */
  defaultCountry?: string;
  className?: string;
  variant?: "primary" | "secondary";
  autoFocus?: boolean;
  /**
   * Called with the raw national text when the user types something that is
   * not part of a phone number (letters, "@"…). When provided, that input is
   * handed over instead of being silently stripped — lets a host swap this
   * field for a plain text one.
   */
  onTextInput?: (raw: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const availableCountries = useMemo<CountryDialInfo[]>(
    () =>
      (countryDialCodes as RawDialCountry[])
        .filter((c) => Array.isArray(c.dialCodes) && c.dialCodes.length > 0)
        .map((c) => ({
          code: c.code,
          name: c.name,
          localizedName: (isArabic && AR_NAMES.get(c.code)) || c.name,
          image: c.image,
          dialCodes: c.dialCodes as string[],
        }))
        .sort((a, b) => a.localizedName.localeCompare(b.localizedName, isArabic ? "ar" : "en")),
    [isArabic]
  );

  const [chosenCountry, setChosenCountry] = useState<CountryDialInfo | null>(
    () =>
      availableCountries.find((c) => c.code ===       (defaultCountry || APP_DEFAULTS.countryCode)) || availableCountries[0] || null
  );
  // Derive the country from the value's dial code; the explicit choice wins
  // when it shares the same prefix (e.g. +1 US vs CA).
  const selectedCountry = useMemo(() => {
    if (value) {
      if (chosenCountry?.dialCodes.some((d) => value.startsWith(d))) return chosenCountry;
      const detected = availableCountries.find((c) =>
        c.dialCodes.some((d) => value.startsWith(d))
      );
      if (detected) return detected;
    }
    return chosenCountry;
  }, [value, chosenCountry, availableCountries]);

  const nationalDigits = useMemo(
    () => getNationalDigits(value || "", selectedCountry),
    [value, selectedCountry]
  );

  function handleNumberChange(next: string) {
    if (onTextInput && !PHONE_CHARS.test(next)) {
      onTextInput(next);
      return;
    }
    const digits = extractDigits(next);
    onChange(digits ? composeInternationalNumber(digits, selectedCountry) : "");
  }

  function handleCountrySelect(country: CountryDialInfo) {
    const digits = getNationalDigits(value || "", selectedCountry);
    setChosenCountry(country);
    setOpen(false);
    setSearch("");
    onChange(digits ? composeInternationalNumber(digits, country) : "");
  }

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableCountries;
    return availableCountries.filter(
      (c) =>
        c.dialCodes.some((d) => d.includes(query)) ||
        c.localizedName.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [search, availableCountries]);

  const dialCode = selectedCountry?.dialCodes?.[0] || "";

  return (
    <TextField
      fullWidth
      type="tel"
      inputMode="tel"
      variant={variant}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      value={nationalDigits}
      onChange={handleNumberChange}
      className={className}
      aria-label={label || ariaLabel || t("clients.phone")}
    >
      {label && <Label>{label}</Label>}
      <InputGroup dir="ltr">
        <InputGroup.Prefix className="pe-0">
          <Popover isOpen={open} onOpenChange={setOpen}>
            <Popover.Trigger className="inline-flex">
              <Button
                size="sm"
                variant="ghost"
                isDisabled={isDisabled}
                aria-label={t("phone.selectCountry")}
                className="h-7 gap-1.5 rounded-lg px-1.5 text-xs font-semibold "
              >
                {selectedCountry?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedCountry.image}
                    alt={selectedCountry.code}
                    className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>🌐</span>
                )}
                {dialCode && <span className="text-neutral-500">{dialCode}</span>}
                <ChevronDown
                  className={`size-3.5 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom start" className="w-72 p-0">
              <Popover.Dialog aria-label={t("phone.selectCountry")} className="flex flex-col p-0">
                <div className="border-b border-app-border p-2">
                  <SearchField
                    autoFocus
                    value={search}
                    onChange={setSearch}
                    variant="secondary"
                    aria-label={t("common.search")}
                  >
                    <SearchField.Group>
                      <SearchField.SearchIcon />
                      <SearchField.Input placeholder={t("phone.searchCountry")} />
                      <SearchField.ClearButton />
                    </SearchField.Group>
                  </SearchField>
                </div>
                <div ref={listRef} className="max-h-72 overflow-y-auto p-1.5">
                  {filteredCountries.length === 0 && (
                    <p className="px-3 py-4 text-center text-sm text-neutral-400">
                      {t("common.noResults")}
                    </p>
                  )}
                  {filteredCountries.map((country) => (
                    <button
                      type="button"
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                        country.code === selectedCountry?.code
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          : ""
                      }`}
                    >
                      {country.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={country.image}
                          alt=""
                          className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span>🌐</span>
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {country.localizedName}
                      </span>
                      <span className="shrink-0 text-xs text-neutral-400" dir="ltr">
                        {country.dialCodes[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
          <span className="mx-1.5 h-5 w-px bg-app-border" />
        </InputGroup.Prefix>
        <InputGroup.Input autoFocus={autoFocus} placeholder={placeholder || "770 123 4567"} className={`min-w-0 text-start ${inputClassName ?? ""}`} />
      </InputGroup>
    </TextField>
  );
}
