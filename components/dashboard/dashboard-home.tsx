"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Banknote, CalendarDays, FolderKanban, ReceiptText, Settings, Shapes, TrendingUp, UserPlus, Users, Blocks } from "lucide-react";
import { AccentHero, AttentionCard, DatedRow, HERO_CHIP, HeroStats, QuickActions, SectionHead, StatBlockCard, type StatItem } from "@/components/ui/dashboard-blocks";
import { Money } from "@/components/ui/money";
import { useSessionUser } from "@/components/layout/session-context";
import { APP_DEFAULTS } from "@/config/app";
import { CUSTOMERS, PROJECTS, localName } from "@/lib/demo-data";
import { fmtDay } from "@/lib/format";
import { englishInitials } from "@/lib/initials";

const noop = () => () => {};
/** Client clock read once (server renders null), so the greeting never causes a hydration mismatch. */
function useNow(): Date | null {
  return useSyncExternalStore(noop, () => NOW, () => null);
}
const NOW = new Date();

export function DashboardHome() {
  const { t, i18n } = useTranslation();
  const user = useSessionUser();
  const now = useNow();
  const lang = i18n.language;
  const cur = APP_DEFAULTS.currency;

  // Simulates the API round-trip so the loading skeletons are visible. Replace with a real fetch.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(id);
  }, []);

  const hour = now?.getHours() ?? 12;
  const greeting = t(hour < 12 ? "dashboard.greeting.morning" : hour < 17 ? "dashboard.greeting.afternoon" : "dashboard.greeting.evening");
  const today = now ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` : null;
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-u-nu-latn" : "en");

  const active = CUSTOMERS.filter((c) => c.status === "active").length;
  const leads = CUSTOMERS.filter((c) => c.status === "lead").length;
  const openProjects = PROJECTS.filter((p) => p.stage !== "done");
  const revenue = CUSTOMERS.reduce((s, c) => s + Math.max(0, c.balance), 0);
  const overdue = CUSTOMERS.filter((c) => c.balance < 0);

  const block = (stats: StatItem[]) => (loaded ? stats : undefined);
  const upcoming = [...openProjects].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <AccentHero>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white/20 text-lg font-semibold ring-4 ring-white/20 sm:size-16 sm:text-xl">
              {englishInitials(user?.name ?? "") || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-white/80">{greeting}</p>
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{user?.name}</h1>
              <p className="truncate text-sm text-white/75">{user?.role ? t(`roles.${user.role.toLowerCase()}`, { defaultValue: user.role }) : null}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-[50%] lg:justify-end">
            {today && (
              <span className={HERO_CHIP}>
                <CalendarDays className="size-3.5 shrink-0" />
                {fmtDay(today, lang)}
              </span>
            )}
            <span className={HERO_CHIP}>
              <TrendingUp className="size-3.5 shrink-0" />
              {t("dashboard.hero.trend", { pct: 12 })}
            </span>
          </div>
        </div>
        <HeroStats
          stats={[
            { icon: Users, value: nf.format(active), label: t("dashboard.hero.activeCustomers"), href: "/dashboard/customers" },
            { icon: FolderKanban, value: nf.format(openProjects.length), label: t("dashboard.hero.openProjects"), href: "/dashboard/projects" },
            { icon: Banknote, value: <Money amount={revenue} currency={cur} minFractionDigits={0} maxFractionDigits={0} />, label: t("dashboard.hero.revenue"), href: "/dashboard/customers" },
            { icon: UserPlus, value: nf.format(leads), label: t("dashboard.hero.newLeads"), href: "/dashboard/customers" },
          ]}
        />
      </AccentHero>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <AttentionCard
            rows={[
              { key: "followUp", label: t("dashboard.attention.rows.followUp"), module: t("nav.customers"), icon: Users, href: "/dashboard/customers", count: 3, tone: "mine" },
              { key: "overdue", label: t("dashboard.attention.rows.overdue"), module: t("nav.customers"), icon: ReceiptText, href: "/dashboard/customers", count: overdue.length, tone: "mine" },
              { key: "approve", label: t("dashboard.attention.rows.approve"), module: t("nav.projects"), icon: FolderKanban, href: "/dashboard/projects", count: 2, tone: "queue" },
            ]}
          />

          <section className="flex flex-col gap-2">
            <SectionHead title={t("dashboard.blocks.heading")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatBlockCard
                icon={Users}
                tint="accent"
                title={t("nav.customers")}
                hint={t("dashboard.blocks.customersHint")}
                href="/dashboard/customers"
                stats={block([
                  { key: "active", label: t("customers.status.active"), value: nf.format(active), tone: "good" },
                  { key: "lead", label: t("customers.status.lead"), value: nf.format(leads) },
                  { key: "vip", label: t("customers.vip"), value: nf.format(CUSTOMERS.filter((c) => c.vip).length) },
                  { key: "overdue", label: t("dashboard.blocks.overdue"), value: nf.format(overdue.length), tone: overdue.length ? "bad" : undefined },
                ])}
              />
              <StatBlockCard
                icon={FolderKanban}
                tint="gold"
                title={t("nav.projects")}
                hint={t("dashboard.blocks.projectsHint")}
                href="/dashboard/projects"
                stats={block([
                  { key: "active", label: t("projects.stage.active"), value: nf.format(PROJECTS.filter((p) => p.stage === "active").length) },
                  { key: "review", label: t("projects.stage.review"), value: nf.format(PROJECTS.filter((p) => p.stage === "review").length), tone: "warn" },
                ])}
                progress={{
                  done: PROJECTS.filter((p) => p.stage === "done").length,
                  total: PROJECTS.length,
                  label: t("dashboard.blocks.progress", { done: PROJECTS.filter((p) => p.stage === "done").length, total: PROJECTS.length }),
                }}
              />
              <StatBlockCard
                icon={Banknote}
                tint="emerald"
                title={t("dashboard.blocks.finance")}
                hint={t("dashboard.blocks.financeHint")}
                href="/dashboard/invoices"
                stats={block([
                  { key: "balance", label: t("dashboard.blocks.balances"), value: <Money amount={revenue} currency={cur} /> },
                  { key: "owed", label: t("dashboard.blocks.owed"), value: <Money amount={overdue.reduce((s, c) => s - c.balance, 0)} currency={cur} />, tone: "bad" },
                ])}
              />
              <StatBlockCard icon={TrendingUp} tint="indigo" title={t("nav.reports")} hint={t("dashboard.blocks.reportsHint")} href="/dashboard/reports" stats={block([])} />
            </div>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-2">
            <SectionHead title={t("dashboard.upcoming.title")} href="/dashboard/projects" link={t("dashboard.upcoming.all")} />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {upcoming.map((p) => {
                const customer = CUSTOMERS.find((c) => c.id === p.customerId);
                return (
                  <DatedRow
                    key={p.id}
                    date={p.due}
                    title={localName(p, lang)}
                    subtitle={customer ? localName(customer, lang) : undefined}
                    tag={t(`projects.stage.${p.stage}`)}
                    color={p.color}
                    href="/dashboard/projects"
                  />
                );
              })}
            </div>
          </section>
          <QuickActions
            title={t("dashboard.quickActions")}
            actions={[
              { key: "customer", label: t("customers.add"), icon: UserPlus, href: "/dashboard/customers?new=1" },
              { key: "project", label: t("nav.projects"), icon: FolderKanban, href: "/dashboard/projects" },
              { key: "components", label: t("nav.components"), icon: Blocks, href: "/dashboard/components" },
              { key: "icons", label: t("nav.icons"), icon: Shapes, href: "/dashboard/icons" },
              { key: "settings", label: t("nav.settings"), icon: Settings, href: "/dashboard/settings" },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
