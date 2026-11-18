"use client";

import { I18nextProvider } from "react-i18next";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { Toast } from "@heroui/react";
import { UserPreferencesProvider } from "@/components/user-preferences-provider";
import { createI18nInstance, type AppLocale } from "@/lib/i18n";

export default function Providers({ locale, children }: { locale: AppLocale; children: React.ReactNode }) {
  const i18n = useMemo(() => createI18nInstance(locale), [locale]);
  const router = useRouter();

  return (
    // Lets HeroUI href props (Table.Row, Dropdown.Item, LinkButton…) use client-side navigation.
    <RouterProvider navigate={router.push}>
      <UserPreferencesProvider>
        <I18nextProvider i18n={i18n}>
          {children}
          <Toast.Provider placement={locale === "ar" ? "bottom start" : "bottom end"} />
        </I18nextProvider>
      </UserPreferencesProvider>
    </RouterProvider>
  );
}
