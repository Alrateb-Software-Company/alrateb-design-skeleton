"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button, Dropdown } from "@heroui/react";
import { Blocks, Globe, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useUserPreference } from "@/hooks/useUserPreference";
import { MobileSidebarButton } from "@/components/layout/mobile-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useSessionUser } from "@/components/layout/session-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { switchLocale, type AppLocale } from "@/lib/i18n";
import { signOutDemo } from "@/lib/session";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function Topbar({ title }: { title?: string }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const user = useSessionUser();
  const [theme, setTheme] = useUserPreference<Theme | null>("ui.theme", null);

  useEffect(() => {
    if (theme) applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const otherLocale: AppLocale = i18n.language === "ar" ? "en" : "ar";

  const signOut = () => {
    signOutDemo();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 box-content flex h-16 items-center justify-between gap-2 border-b border-app-border bg-app-surface/80 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-4 md:gap-3 md:px-6">
      <div className="flex min-w-0 items-center gap-1">
        <MobileSidebarButton />
        <h1 className="sr-only truncate text-lg font-semibold tracking-tight sm:not-sr-only">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
        <Button isIconOnly variant="ghost" aria-label={t("common.toggleTheme")} onPress={toggleTheme} className="hidden rounded-full text-neutral-500 sm:inline-flex dark:text-neutral-400">
          <Sun className="hidden size-5 dark:block" />
          <Moon className="size-5 dark:hidden" />
        </Button>

        <NotificationBell />

        <Dropdown>
          <Dropdown.Trigger aria-label={t("common.accountMenu")} className="h-auto rounded-full bg-transparent p-0 shadow-none hover:bg-transparent">
            <UserAvatar name={user?.name || "?"} />
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end" className="min-w-56">
            <div className="border-b border-app-border px-3 py-2.5 !text-start">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-neutral-500">{user?.email}</p>
            </div>
            <Dropdown.Menu aria-label={t("common.actions")}>
              <Dropdown.Item id="settings" textValue={t("nav.settings")} href="/dashboard/settings">
                <Settings className="size-4 text-neutral-500" />
                {t("nav.settings")}
              </Dropdown.Item>
              <Dropdown.Item id="components" textValue={t("nav.components")} href="/dashboard/components">
                <Blocks className="size-4 text-neutral-500" />
                {t("nav.components")}
              </Dropdown.Item>
              <Dropdown.Item id="language" textValue={t("common.language")} onAction={() => switchLocale(otherLocale)}>
                <Globe className="size-4 text-neutral-500" />
                {otherLocale === "ar" ? "العربية" : "English"}
              </Dropdown.Item>
              {/* Phones: the theme button moves in here so the topbar fits. */}
              <Dropdown.Item id="theme" textValue={t("common.toggleTheme")} onAction={toggleTheme} className="sm:hidden">
                <Sun className="hidden size-4 text-neutral-500 dark:block" />
                <Moon className="size-4 text-neutral-500 dark:hidden" />
                <span className="dark:hidden">{t("nav.darkMode")}</span>
                <span className="hidden dark:inline">{t("nav.lightMode")}</span>
              </Dropdown.Item>
              <Dropdown.Item id="signout" textValue={t("auth.signOut")} variant="danger" onAction={signOut}>
                <LogOut className="size-4" />
                {t("auth.signOut")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
