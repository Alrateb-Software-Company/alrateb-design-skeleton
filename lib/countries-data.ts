// Typed access to the alrateb countries dataset (lib/countries.js).
import { countries as rawCountries } from "@/lib/countries.js";

export interface Country {
  code: string;
  name: string;
  name_ar?: string;
  currency?: string;
  currency_symbol?: string;
  currency_ar?: string;
  currency_symbol_ar?: string;
}

export const countries: Country[] = rawCountries as Country[];

const byCode = new Map(countries.map((c) => [c.code.toUpperCase(), c]));
const byName = new Map(countries.map((c) => [c.name.toLowerCase(), c]));

/** ISO alpha-2 lookup (case-insensitive); null when unknown. */
export function countryByCode(code: string | null | undefined): Country | null {
  if (!code) return null;
  return byCode.get(code.trim().toUpperCase()) ?? null;
}

/** Country from its stored English name (how CountrySelect persists values). */
export function countryByName(name: string | null | undefined): Country | null {
  if (!name) return null;
  return byName.get(name.trim().toLowerCase()) ?? null;
}

/** Local currency code (ISO 4217) for a country; null when unknown. */
export function countryCurrency(code: string | null | undefined): string | null {
  return countryByCode(code)?.currency_symbol ?? null;
}

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && byCode.has(value.trim().toUpperCase());
}

export function countryLabel(country: Country, locale: string): string {
  return locale === "ar" && country.name_ar ? country.name_ar : country.name;
}

export function flagUrl(code: string): string {
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${code.toLowerCase()}.svg`;
}

export interface CurrencyOption {
  code: string;
  name: string;
  name_ar: string;
  symbol: string;
  symbol_ar: string;
}

// Unique currencies derived from the countries list.
const seen = new Set<string>();
export const currencyOptions: CurrencyOption[] = countries
  .filter((c) => {
    if (!c.currency_symbol || seen.has(c.currency_symbol)) return false;
    seen.add(c.currency_symbol);
    return true;
  })
  .map((c) => ({
    code: c.currency_symbol!,
    name: c.currency || c.currency_symbol!,
    name_ar: c.currency_ar || c.currency || c.currency_symbol!,
    symbol: c.currency_symbol!,
    symbol_ar: c.currency_symbol_ar || c.currency_symbol!,
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

export function currencyLabel(option: CurrencyOption, locale: string): string {
  return locale === "ar" ? `${option.code} — ${option.name_ar}` : `${option.code} — ${option.name}`;
}
