"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Tooltip } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { NAV_SECTIONS, isNavItemActive, type NavItem } from "@/config/nav";

type NavBadge = NonNullable<NavItem["badge"]>;

/** 1–99, then "99+". */
export const badgeText = (count: number) => (count > 99 ? "99+" : String(count));

function NavLink({ item, active, collapsed = false }: { item: NavItem; active: boolean; collapsed?: boolean }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(item.labelKey);
  const badge = item.badge;
  const tone = active
    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
    : "text-neutral-600 hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5";
  const soonTone = item.soon ? "opacity-50" : "";
  const mine = badge?.tone !== "queue";

  if (collapsed) {
    return (
      <Tooltip delay={200} closeDelay={0}>
        <Tooltip.Trigger
          render={(props) => (
            <Link
              {...(props as unknown as Omit<React.ComponentPropsWithRef<typeof Link>, "href">)}
              href={item.href}
              role={undefined}
              aria-label={badge ? `${label} (${badge.count})` : label}
              aria-current={active ? "page" : undefined}
              className={`relative mx-auto flex size-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 ${tone} ${soonTone}`}
            >
              <Icon className="size-5 shrink-0" />
              {badge && (
                <span className={`absolute -end-0.5 -top-0.5 min-w-4 rounded-full px-1 text-center text-[10px] font-semibold leading-4 text-white tabular-nums ring-2 ring-app-surface ${mine ? "bg-red-500" : "bg-amber-500"}`} aria-hidden>
                  {badgeText(badge.count)}
                </span>
              )}
            </Link>
          )}
        />
        <Tooltip.Content placement="end">
          <span className="font-medium">{label}</span>
          {item.soon && <span className="opacity-70"> · {t("common.soon")}</span>}
          {badge && <span className="opacity-70"> · {badge.count}</span>}
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${tone} ${soonTone}`}>
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{label}</span>
      {item.soon && <span className="ms-auto rounded-md bg-neutral-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral-500">{t("common.soon")}</span>}
      {badge && (
        <span className="ms-auto flex shrink-0">
          <NavCount badge={badge} />
        </span>
      )}
    </Link>
  );
}

function NavCount({ badge }: { badge: NavBadge }) {
  return (
    <Badge color={badge.tone === "queue" ? "warning" : "danger"} size="sm" className="static shrink-0 transform-none tabular-nums">
      <Badge.Label>{badgeText(badge.count)}</Badge.Label>
    </Badge>
  );
}

/** Grouped sidebar. `collapsed` renders the icon-only rail with tooltips. */
export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (collapsed) {
    return (
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.key} className="flex flex-col gap-1">
            {idx > 0 && <div className="mx-2 my-1 border-t border-app-border" aria-hidden />}
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed active={isNavItemActive(pathname, item.href)} />
            ))}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {NAV_SECTIONS.map((section) => {
        const isCollapsed = collapsedSections.has(section.key);
        const hasActive = section.items.some((item) => isNavItemActive(pathname, item.href));
        // A folded section still shows what waits inside it, so nothing hides behind the fold.
        const waiting = section.items.map((item) => item.badge).filter((b): b is NavBadge => !!b);
        const hidden = isCollapsed && waiting.length ? { count: waiting.reduce((s, b) => s + b.count, 0), tone: waiting.some((b) => b.tone === "mine") ? "mine" : "queue" } : null;
        if (section.key === "overview") {
          return section.items.map((item) => <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />);
        }
        return (
          <div key={section.key} className="mt-2 first:mt-0">
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              aria-expanded={!isCollapsed}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                hasActive && isCollapsed ? "text-sky-600 dark:text-sky-400" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              <span className="truncate">{t(section.labelKey)}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                {hidden && (
                  <span className={`min-w-4 rounded-full px-1 text-center text-[10px] font-semibold normal-case leading-4 tracking-normal text-white tabular-nums ${hidden.tone === "mine" ? "bg-red-500" : "bg-amber-500"}`}>
                    {badgeText(hidden.count)}
                  </span>
                )}
                <ChevronDown className={`size-3.5 transition-transform ${isCollapsed ? "-rotate-90 rtl:rotate-90" : ""}`} />
              </span>
            </button>
            {!isCollapsed && (
              <div className="mt-0.5 flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
