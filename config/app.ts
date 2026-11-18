/**
 * App-wide identity and defaults. Rename these when you start a new product from the skeleton.
 * (In a real app the defaults usually come from the tenant's settings API.)
 */
export const APP_NAME = { en: "Alrateb", ar: "الراتب" } as const;

export const APP_DEFAULTS = {
  /** ISO 3166-1 alpha-2: preselected country in phone / country pickers. */
  countryCode: "OM",
  /** ISO 4217: currency for <Money> when none is given. */
  currency: "OMR",
  timezone: "Asia/Muscat",
} as const;

export function appName(locale: string): string {
  return locale === "ar" ? APP_NAME.ar : APP_NAME.en;
}
