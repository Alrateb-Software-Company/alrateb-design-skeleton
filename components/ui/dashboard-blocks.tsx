"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@heroui/react";
import { BellRing, CheckCircle2, ChevronRight, type LucideIcon } from "lucide-react";

// Dashboard / home building blocks. Same anatomy as the production apps — compose pages from these.

/** Translucent chip on the accent hero. */
export const HERO_CHIP = "inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm";

/** Tint classes for icon tiles, one per colour family. Use these instead of inventing new tints. */
export const TINT = {
  accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  gold: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  neutral: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300",
} as const;
export type Tint = keyof typeof TINT;

/** The accent-coloured hero card at the top of a home page. */
export function AccentHero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden rounded-3xl bg-accent p-5 text-white shadow-lg shadow-black/10 sm:p-6 lg:p-7 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/35" />
      <div aria-hidden className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 start-1/4 size-64 rounded-full bg-black/15 blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

export interface HeroStat {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  href: string;
}

/** Two (phones) / four (xl) tappable numbers along the bottom of the hero. On phones the icon sits above the value so money fits. */
export function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-3">
      {stats.map(({ icon: Icon, value, label, href }) => (
        <Link key={label} href={href} className="flex flex-col items-start gap-2 rounded-2xl bg-white/[0.13] p-3 ring-1 ring-white/10 transition hover:bg-white/20 active:scale-[0.98] sm:flex-row sm:items-center sm:gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
            <Icon className="size-[18px]" />
          </span>
          <span className="w-full min-w-0">
            <span className="block truncate text-xl font-bold leading-none tabular-nums">{value}</span>
            <span className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight text-white/80">{label}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Small "see all" link at the end of a section heading. */
export function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-0.5 text-xs font-medium text-accent hover:underline">
      {label}
      <ChevronRight className="size-3.5 rtl:rotate-180" />
    </Link>
  );
}

/** Section heading with an optional link. */
export function SectionHead({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-0.5">
      <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{title}</h2>
      {href && link && <SectionLink href={href} label={link} />}
    </div>
  );
}

export interface StatItem {
  key: string;
  label: string;
  value: ReactNode;
  tone?: "good" | "bad" | "warn";
}

const STAT_TONE: Record<NonNullable<StatItem["tone"]>, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  bad: "text-red-600 dark:text-red-400",
  warn: "text-amber-600 dark:text-amber-400",
};

/** One area's figures: up to four numbers and a link into the module. `stats` undefined = loading. */
export function StatBlockCard({ icon: Icon, tint = "accent", title, hint, href, stats, progress }: {
  icon: LucideIcon;
  tint?: Tint;
  title: string;
  hint?: string;
  href: string;
  stats: StatItem[] | undefined;
  progress?: { done: number; total: number; label: string };
}) {
  const { t } = useTranslation();
  return (
    <Link href={href} className="group flex flex-col gap-3 rounded-3xl bg-app-surface p-4 shadow-sm outline-none transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent">
      <div className="flex items-center gap-2.5">
        <span className={`grid size-9 shrink-0 place-items-center rounded-2xl ${TINT[tint]}`}>
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{title}</p>
          {hint && <p className="truncate text-xs text-neutral-500">{hint}</p>}
        </div>
        <ChevronRight className="size-4 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
      </div>
      {!stats ? (
        <Skeleton className="h-[5.5rem] rounded-2xl" />
      ) : stats.length === 0 ? (
        <p className="rounded-2xl bg-neutral-500/5 px-3 py-6 text-center text-sm text-neutral-500">{t("common.noData")}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.key} className="min-w-0 rounded-2xl bg-neutral-500/5 px-3 py-2">
              <dd className={`truncate text-lg font-semibold leading-tight tabular-nums ${s.tone ? STAT_TONE[s.tone] : ""}`} dir="ltr" style={{ textAlign: "start" }}>
                {s.value}
              </dd>
              <dt className="truncate text-xs text-neutral-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}
      {stats && progress && progress.total > 0 && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-500/15">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (progress.done / progress.total) * 100)}%` }} />
          </div>
          <span className="tabular-nums">{progress.label}</span>
        </div>
      )}
    </Link>
  );
}

export interface AttentionRow {
  key: string;
  label: string;
  module: string;
  icon: LucideIcon;
  href: string;
  count: number;
  /** mine = assigned to the user (red), queue = waiting for someone with access (amber). */
  tone: "mine" | "queue";
}

/** "Needs your attention": every outstanding item as a clickable line, yours first. */
export function AttentionCard({ rows }: { rows: AttentionRow[] }) {
  const { t } = useTranslation();

  if (!rows.length) {
    return (
      <div className="flex items-center gap-3 rounded-3xl bg-app-surface p-4 shadow-sm">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{t("dashboard.attention.clearTitle")}</p>
          <p className="text-sm text-neutral-500">{t("dashboard.attention.clearHint")}</p>
        </div>
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "mine" ? -1 : 1));
  const total = rows.reduce((s, r) => s + r.count, 0);
  return (
    <section className="rounded-3xl bg-app-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3 px-1">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
          <BellRing className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{t("dashboard.attention.title")}</h3>
          <p className="text-xs text-neutral-500">{t("dashboard.attention.hint")}</p>
        </div>
        <span className="rounded-full bg-neutral-500/10 px-2.5 py-0.5 text-sm font-semibold tabular-nums">{total}</span>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sorted.map((r) => {
          const Icon = r.icon;
          const mine = r.tone === "mine";
          return (
            <li key={r.key}>
              <Link
                href={r.href}
                className={`group flex items-center gap-3 rounded-2xl border p-3 transition-colors ${mine ? "border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/10" : "border-amber-500/25 bg-amber-500/[0.05] hover:bg-amber-500/10"}`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${mine ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.label}</span>
                  <span className="block truncate text-xs text-neutral-500">
                    {r.module} · {t(mine ? "dashboard.attention.yours" : "dashboard.attention.queue")}
                  </span>
                </span>
                <span className={`min-w-7 rounded-full px-2 py-0.5 text-center text-sm font-semibold text-white tabular-nums ${mine ? "bg-red-500" : "bg-amber-500"}`}>{r.count}</span>
                <ChevronRight className="size-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Dated row for upcoming items (calendar, deadlines). `color` is any hex. */
export function DatedRow({ date, title, subtitle, tag, color, href }: { date: string; title: string; subtitle?: string; tag?: string; color: string; href: string }) {
  const { i18n } = useTranslation();
  const d = new Date(`${date}T00:00:00Z`);
  const month = new Intl.DateTimeFormat(i18n.language === "ar" ? "ar-u-nu-latn" : "en", { timeZone: "UTC", month: "short" }).format(d);
  return (
    <Link href={href} className="flex w-full items-center gap-3 rounded-2xl bg-app-surface p-3 text-start shadow-sm ring-1 ring-black/[0.04] transition active:scale-[0.99] dark:ring-white/[0.06]">
      <span className="flex w-11 shrink-0 flex-col items-center rounded-xl py-1.5 text-center" style={{ backgroundColor: `${color}1a`, color }}>
        <span className="text-[10px] font-semibold uppercase leading-none">{month}</span>
        <span className="text-lg font-bold leading-tight">{d.getUTCDate()}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle && <span className="block truncate text-xs text-neutral-500">{subtitle}</span>}
      </span>
      {tag && (
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}1a`, color }}>
          {tag}
        </span>
      )}
    </Link>
  );
}

/** Grid of shortcut tiles. */
export function QuickActions({ title, actions }: { title: string; actions: { key: string; label: string; icon: LucideIcon; href: string }[] }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionHead title={title} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
        {actions.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href} className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-app-surface p-3 text-sm font-medium shadow-sm transition hover:shadow-md active:scale-[0.99]">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 break-words leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
