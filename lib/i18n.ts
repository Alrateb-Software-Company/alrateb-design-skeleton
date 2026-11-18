import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";
import { appName } from "@/config/app";

export type AppLocale = "en" | "ar";

export const LOCALES: AppLocale[] = ["en", "ar"];

export function createI18nInstance(locale: AppLocale): I18nInstance {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    // `{{app}}` resolves to the product name in every string (never hard-code it).
    interpolation: { escapeValue: false, defaultVariables: { app: appName(locale) } },
    returnEmptyString: false,
  });
  return instance;
}

/** Persist locale choice and reload so the server layout re-renders lang/dir. */
export function switchLocale(locale: AppLocale) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}
