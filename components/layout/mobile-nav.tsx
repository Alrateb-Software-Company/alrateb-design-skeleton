"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Drawer, ToggleButton } from "@heroui/react";
import { Menu, X, Building2 } from "lucide-react";
import { SidebarNav, badgeText } from "./nav";
import { NAV_ITEMS, isNavItemActive, type NavItem } from "@/config/nav";

const MAX_TABS = 4;

type NavBadge = NonNullable<NavItem["badge"]>;

/** Mobile bottom tab bar: first N nav items + "More" sheet with the rest. */
export function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => !i.soon);
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs = items.slice(0, MAX_TABS);
  const rest = items.slice(MAX_TABS);
  const hasMore = rest.length > 0;
  const activeInMore = hasMore && rest.some((item) => isNavItemActive(pathname, item.href));
  const restBadges = rest.map((i) => i.badge).filter((b): b is NavBadge => !!b);
  const pill = (b: NavBadge, cls: string) => (
    <span className={`absolute min-w-4 rounded-full px-1 text-center text-[10px] font-semibold leading-4 text-white tabular-nums ring-2 ring-app-surface ${b.tone === "queue" ? "bg-amber-500" : "bg-red-500"} ${cls}`}>{badgeText(b.count)}</span>
  );

  return (
    <>
      <Drawer isOpen={moreOpen} onOpenChange={setMoreOpen}>
        <Drawer.Backdrop className="md:hidden">
          <Drawer.Content placement="bottom" className="md:hidden">
            <Drawer.Dialog aria-label={t("nav.more")} className="pb-safe">
              <Drawer.Handle />
              <Drawer.Body className="px-4 pb-5 pt-1">
                <div className="grid grid-cols-4 gap-2">
                  {rest.map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-[background-color,color,transform] duration-150 active:scale-90 ${
                          active ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "text-neutral-600 hover:bg-neutral-500/5 dark:text-neutral-400"
                        }`}
                      >
                        {item.badge && pill(item.badge, "end-2 top-2")}
                        <Icon className="size-6" />
                        <span className="text-[11px] font-medium leading-tight">{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-app-border bg-app-surface/90 backdrop-blur-xl pb-safe md:hidden">
        <div className="relative flex items-stretch justify-around">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-[color,transform] duration-150 active:scale-90 ${
                  active ? "text-sky-600 dark:text-sky-400" : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                <Icon className="size-5" />
                {item.badge && pill(item.badge, "start-1/2 top-1 ms-2")}
                <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
          {hasMore && (
            <ToggleButton
              variant="ghost"
              isSelected={moreOpen}
              onChange={setMoreOpen}
              aria-label={t("nav.more")}
              className={`relative flex h-auto flex-1 flex-col items-center gap-0.5 rounded-none bg-transparent py-2 transition-[color,transform] duration-150 active:scale-90 ${
                moreOpen || activeInMore ? "text-sky-600 dark:text-sky-400" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {moreOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              {!moreOpen && restBadges.length > 0 && (
                <span className={`absolute start-1/2 top-1.5 ms-2 size-2 rounded-full ring-2 ring-app-surface ${restBadges.some((b) => b.tone === "mine") ? "bg-red-500" : "bg-amber-500"}`} aria-hidden />
              )}
              <span className="text-[10px] font-medium">{t("nav.more")}</span>
            </ToggleButton>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Topbar burger (phones/tablets only): the full grouped sidebar in a side drawer, since the
 * desktop sidebar is hidden below md and the bottom tab bar only fits a few items.
 */
export function MobileSidebarButton() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const isAr = i18n.dir() === "rtl";

  return (
    <>
      <Button isIconOnly variant="ghost" aria-label={t("nav.openMenu")} aria-expanded={open} onPress={() => setOpen(true)} className="relative -ms-1.5 shrink-0 rounded-full text-neutral-600 md:hidden dark:text-neutral-300">
        <Menu className="size-5" />
      </Button>
      <Drawer isOpen={open} onOpenChange={setOpen}>
        <Drawer.Backdrop className="md:hidden">
          {/* HeroUI aligns with logical justify-* but slides with physical translate; keep the drawer on the start side in RTL. */}
          <Drawer.Content placement={isAr ? "right" : "left"} className={`md:hidden ${isAr ? "justify-start" : ""}`}>
            <Drawer.Dialog aria-label={t("nav.openMenu")} className="flex h-full w-72 max-w-[85vw] flex-col p-0 pb-safe pt-[env(safe-area-inset-top)]">
              <Drawer.CloseTrigger aria-label={t("common.close")} className="mt-[env(safe-area-inset-top)]" />
              <div className="[&>div]:pe-12">
                <SidebarBrand />
              </div>
              <div className="flex min-h-0 flex-1 flex-col" onClickCapture={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
                <SidebarNav />
              </div>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}

/** Logo tile + product name at the top of the sidebar. Swap the icon for an <img> logo per product. */
export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const name = t("common.appName");

  return (
    <div title={collapsed ? name : undefined} className={`flex items-center gap-3 border-b border-app-border py-5 ${collapsed ? "justify-center px-2" : "px-5"}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
        <Building2 className="size-5" />
      </div>
      {!collapsed && (
        <div className="min-w-0 !text-start">
          <p className="truncate text-sm font-semibold leading-tight text-start">{name}</p>
          <p className="truncate text-xs text-neutral-400 text-start">{t("common.appTagline")}</p>
        </div>
      )}
    </div>
  );
}
