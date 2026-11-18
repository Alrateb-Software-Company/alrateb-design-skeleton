"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Input, Label, TextField } from "@heroui/react";
import { BarChart3, CalendarPlus, Building2, FileText, FolderKanban, Inbox, LayoutDashboard, Plus, UserPlus, Users, Wallet } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { FormFooter, FormGrid, FormGroupLabel, FormIntro, FormSection } from "@/components/ui/form-section";
import { AccentHero, AttentionCard, DatedRow, HERO_CHIP, HeroStats, QuickActions, SectionHead, StatBlockCard } from "@/components/ui/dashboard-blocks";
import { FeatureDisabledNotice } from "@/components/ui/feature-disabled-notice";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Example, ShowcaseSection } from "./showcase-kit";

export function LayoutSection() {
  const { t } = useTranslation();
  const [name, setName] = useState("Alrateb");

  return (
    <ShowcaseSection id="layout" title={t("showcase.sections.layout")} hint={t("showcase.hints.layout")}>
      <Example title="PageHeader" code={`<PageHeader title="Customers" subtitle="12 customers" icon={<Users className="size-5" />}\n  action={{ label: "Add customer", icon: <Plus className="size-4" />, onPress: add }} />`}>
        <div className="-mb-6">
          <PageHeader title={t("customers.title")} subtitle={t("customers.subtitle", { count: 12 })} icon={<Users className="size-5" />} action={{ label: t("customers.add"), icon: <Plus className="size-4" />, onPress: () => {} }} />
        </div>
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title="EmptyState" code={`<EmptyState icon={<Inbox className="size-6" />} title="No customers yet"\n  hint="Add your first customer to get started." action={{ label: "Add customer", onPress: add }} />`}>
          <EmptyState icon={<Inbox className="size-6" />} title={t("customers.empty")} hint={t("customers.emptyHint")} action={{ label: t("customers.add"), onPress: () => {} }} />
        </Example>
        <Example title="Card · FeatureDisabledNotice" code={`<Card className="flex items-start gap-3">...</Card>\n<FeatureDisabledNotice />`}>
          <div className="flex flex-col gap-3">
            <Card className="flex flex-row items-center gap-3">
              <UserAvatar name="Sara Al Balushi" />
              <div className="min-w-0">
                <p className="font-semibold">Sara Al Balushi</p>
                <p className="text-xs text-neutral-500">{t("showcase.demo.cardHint")}</p>
              </div>
            </Card>
            <FeatureDisabledNotice />
          </div>
        </Example>
      </div>

      <Example
        title="FormSection · FormGrid · FormIntro · FormFooter"
        code={`<FormSection icon={<Building2 className="size-4" />} title="Company" hint="Shown on documents">
  <FormGrid>
    <TextField variant="secondary" ...><Label>Name</Label><Input /></TextField>
  </FormGrid>
</FormSection>
<FormFooter error={error}><Button variant="tertiary">Cancel</Button><Button>Save</Button></FormFooter>`}
      >
        <div className="flex flex-col gap-4">
          <FormIntro media={<UserAvatar name={name || "?"} size="lg" />} hint={t("showcase.demo.introHint")}>
            <span className="font-semibold">{name}</span>
          </FormIntro>
          <FormSection icon={<Building2 className="size-4" />} title={t("settings.org.title")} hint={t("settings.org.hint")} actions={<Button size="sm" variant="ghost">{t("common.edit")}</Button>}>
            <FormGrid>
              <TextField variant="secondary" value={name} onChange={setName}>
                <Label>{t("settings.org.name")}</Label>
                <Input />
              </TextField>
              <TextField variant="secondary" defaultValue="CR-1234567">
                <Label>{t("showcase.demo.registration")}</Label>
                <Input dir="ltr" />
              </TextField>
            </FormGrid>
            <FormGroupLabel>{t("showcase.demo.groupLabel")}</FormGroupLabel>
            <FormGrid cols={3}>
              {["A", "B", "C"].map((x) => (
                <TextField key={x} variant="secondary">
                  <Label>
                    {t("showcase.demo.field")} {x}
                  </Label>
                  <Input />
                </TextField>
              ))}
            </FormGrid>
          </FormSection>
          <FormFooter error={t("showcase.demo.footerError")}>
            <Button variant="tertiary">{t("common.cancel")}</Button>
            <Button>{t("common.save")}</Button>
          </FormFooter>
        </div>
      </Example>

      <Example title={t("showcase.ex.dashboardBlocks")} code={`import { AccentHero, HeroStats, StatBlockCard, AttentionCard, DatedRow, QuickActions } from "@/components/ui/dashboard-blocks";`}>
        <div className="flex flex-col gap-5">
          <AccentHero>
            <span className={HERO_CHIP}>
              <LayoutDashboard className="size-3.5" />
              AccentHero
            </span>
            <h3 className="mt-3 text-2xl font-bold">{t("showcase.demo.heroTitle")}</h3>
            <HeroStats
              stats={[
                { icon: Users, value: 128, label: t("dashboard.hero.activeCustomers"), href: "/dashboard/customers" },
                { icon: FolderKanban, value: 9, label: t("dashboard.hero.openProjects"), href: "/dashboard/projects" },
                { icon: Wallet, value: "4.2k", label: t("dashboard.hero.revenue"), href: "/dashboard/invoices" },
                { icon: UserPlus, value: 6, label: t("dashboard.hero.newLeads"), href: "/dashboard/customers" },
              ]}
            />
          </AccentHero>
          <div className="grid gap-4 md:grid-cols-2">
            <StatBlockCard
              icon={Users}
              tint="accent"
              title={t("nav.customers")}
              hint={t("dashboard.blocks.customersHint")}
              href="/dashboard/customers"
              stats={[
                { key: "a", label: t("customers.status.active"), value: 84, tone: "good" },
                { key: "b", label: t("dashboard.blocks.overdue"), value: 3, tone: "bad" },
              ]}
              progress={{ done: 84, total: 128, label: "84 / 128" }}
            />
            <StatBlockCard icon={BarChart3} tint="gold" title={t("nav.reports")} hint={t("showcase.demo.loadingState")} href="/dashboard/reports" stats={undefined} />
          </div>
          <AttentionCard
            rows={[
              { key: "f", label: t("dashboard.attention.rows.followUp"), module: t("nav.customers"), icon: Users, href: "/dashboard/customers", count: 3, tone: "mine" },
              { key: "a", label: t("dashboard.attention.rows.approve"), module: t("nav.projects"), icon: FileText, href: "/dashboard/projects", count: 2, tone: "queue" },
            ]}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <SectionHead title="DatedRow" href="/dashboard/projects" link={t("dashboard.upcoming.all")} />
              <DatedRow date="2026-03-14" title={t("showcase.demo.eventTitle")} subtitle={t("showcase.demo.eventSub")} tag={t("projects.stage.review")} color="#c29a4b" href="/dashboard/projects" />
              <DatedRow date="2026-03-21" title={t("showcase.demo.eventTitle2")} color="#0f766e" href="/dashboard/projects" />
            </div>
            <QuickActions
              title="QuickActions"
              actions={[
                { key: "c", label: t("customers.add"), icon: UserPlus, href: "/dashboard/customers?new=1" },
                { key: "p", label: t("projects.add"), icon: CalendarPlus, href: "/dashboard/projects" },
              ]}
            />
          </div>
        </div>
      </Example>
    </ShowcaseSection>
  );
}
