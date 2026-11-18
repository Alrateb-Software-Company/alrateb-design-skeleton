"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Chip, Input, Label, TextField, toast } from "@heroui/react";
import { CalendarClock, FolderKanban, LayoutGrid, List, Plus, Activity, CheckCircle2, MessageSquare, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { DataTable } from "@/components/ui/data-table";
import { Modal, useModalSessionKey } from "@/components/ui/modal";
import { FormFooter, FormGrid, FormSection } from "@/components/ui/form-section";
import { AppAutocomplete } from "@/components/ui/app-select";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { CreatableMultiPicker } from "@/components/ui/creatable-picker";
import { InlineSwatchPicker } from "@/components/ui/color-picker";
import { Money } from "@/components/ui/money";
import { Tabs } from "@heroui/react";
import { usePersistedTab } from "@/hooks/usePersistedTab";
import { APP_DEFAULTS } from "@/config/app";
import { CUSTOMERS, PROJECTS, STAGES, localName, type Project, type ProjectStage } from "@/lib/demo-data";
import { fmtDay, timeAgo } from "@/lib/format";

const STAGE_COLOR: Record<ProjectStage, "default" | "accent" | "warning" | "success"> = { planning: "default", active: "accent", review: "warning", done: "success" };
const SWATCHES = ["#0f766e", "#c29a4b", "#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#0ea5e9", "#64748b"];

function StageChip({ stage }: { stage: ProjectStage }) {
  const { t } = useTranslation();
  return (
    <Chip size="sm" variant="soft" color={STAGE_COLOR[stage]}>
      <Chip.Label>{t(`projects.stage.${stage}`)}</Chip.Label>
    </Chip>
  );
}

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-500/15">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-9 text-end text-xs tabular-nums text-neutral-500">{value}%</span>
    </div>
  );
}

/** Reference tabbed page: the selected tab lives in the URL (?tab=list) via usePersistedTab. */
export function ProjectsView() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const tabs = usePersistedTab("board");
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [creating, setCreating] = useState(false);
  const customerName = (id: number) => {
    const c = CUSTOMERS.find((x) => x.id === id);
    return c ? localName(c, lang) : "—";
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("projects.title")}
        subtitle={t("projects.subtitle")}
        icon={<FolderKanban className="size-5" />}
        action={{ label: t("projects.add"), icon: <Plus className="size-4" />, onPress: () => setCreating(true) }}
      />

      <Tabs {...tabs.props}>
        <Tabs.ListContainer className="max-w-full overflow-x-auto">
          <Tabs.List aria-label={t("projects.title")} className="max-w-[fit-content]">
            <Tabs.Tab id="board" className="max-w-[fit-content] gap-1.5 whitespace-nowrap">
              <LayoutGrid className="size-4" />
              {t("projects.tabs.board")}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="list" className="max-w-[fit-content] gap-1.5 whitespace-nowrap">
              <List className="size-4" />
              {t("projects.tabs.list")}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="activity" className="max-w-[fit-content] gap-1.5 whitespace-nowrap">
              <Activity className="size-4" />
              {t("projects.tabs.activity")}
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="board" className="pt-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((stage) => {
              const items = projects.filter((p) => p.stage === stage);
              return (
                <section key={stage} className="flex flex-col gap-2 rounded-3xl bg-neutral-500/5 p-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold">{t(`projects.stage.${stage}`)}</h3>
                    <span className="rounded-full bg-neutral-500/10 px-2 text-xs font-semibold tabular-nums">{items.length}</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-neutral-500/20 px-3 py-6 text-center text-xs text-neutral-500">{t("projects.emptyStage")}</p>
                  ) : (
                    items.map((p) => (
                      <article key={p.id} className="flex flex-col gap-3 rounded-2xl bg-app-surface p-3 shadow-sm">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{localName(p, lang)}</p>
                            <p className="truncate text-xs text-neutral-500">{customerName(p.customerId)}</p>
                          </div>
                        </div>
                        <Progress value={p.progress} color={p.color} />
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <CalendarClock className="size-3.5" />
                            {fmtDay(p.due, lang, false)}
                          </span>
                          <Money amount={p.budget} currency={APP_DEFAULTS.currency} minFractionDigits={0} maxFractionDigits={0} className="font-medium text-neutral-700 dark:text-neutral-300" />
                        </div>
                      </article>
                    ))
                  )}
                </section>
              );
            })}
          </div>
        </Tabs.Panel>

        <Tabs.Panel id="list" className="pt-5">
          <DataTable
            framed
            ariaLabel={t("projects.title")}
            columns={[
              { key: "name", label: t("projects.fields.name"), isRowHeader: true, cardTitle: true },
              { key: "customer", label: t("projects.fields.customer"), cardSubtitle: true },
              { key: "progress", label: t("projects.fields.progress"), className: "w-48" },
              { key: "due", label: t("projects.fields.due") },
              { key: "budget", label: t("projects.fields.budget") },
              { key: "stage", label: t("projects.fields.stage"), cardTrailing: true },
            ]}
            rows={projects.map((p) => ({
              key: p.id,
              cells: {
                name: (
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    {localName(p, lang)}
                  </span>
                ),
                customer: customerName(p.customerId),
                progress: <Progress value={p.progress} color={p.color} />,
                due: fmtDay(p.due, lang, false),
                budget: <Money amount={p.budget} currency={APP_DEFAULTS.currency} minFractionDigits={0} maxFractionDigits={0} />,
                stage: <StageChip stage={p.stage} />,
              },
            }))}
          />
        </Tabs.Panel>

        <Tabs.Panel id="activity" className="pt-5">
          <ActivityFeed />
        </Tabs.Panel>
      </Tabs>

      <NewProjectModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(p) => {
          setProjects((l) => [p, ...l]);
          setCreating(false);
          tabs.setTab("board");
          toast.success(t("projects.created"));
        }}
      />
    </div>
  );
}

const FEED = [
  { id: 1, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", key: "completed", project: 4, mins: 35 },
  { id: 2, icon: MessageSquare, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400", key: "commented", project: 1, mins: 180 },
  { id: 3, icon: Upload, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400", key: "uploaded", project: 2, mins: 60 * 20 },
  { id: 4, icon: FolderKanban, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400", key: "moved", project: 2, mins: 60 * 50 },
];

function ActivityFeed() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [now] = useState(() => Date.now());
  return (
    <section className="rounded-3xl bg-app-surface p-2 shadow-sm">
      <ol className="relative">
        {FEED.map((e, i) => {
          const Icon = e.icon;
          const project = PROJECTS.find((p) => p.id === e.project)!;
          return (
            <li key={e.id} className="relative flex gap-3 p-3">
              {i < FEED.length - 1 && <span aria-hidden className="absolute start-[1.85rem] top-12 bottom-0 w-px bg-app-border" />}
              <span className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ${e.tone}`}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm">
                  <span className="font-semibold">{t("projects.feed.actor")}</span> {t(`projects.feed.${e.key}`)}{" "}
                  <span className="font-medium text-accent">{localName(project, lang)}</span>
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(new Date(now - e.mins * 60_000), lang)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function NewProjectModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (p: Project) => void }) {
  const { t } = useTranslation();
  const key = useModalSessionKey(open);
  return (
    <Modal open={open} onClose={onClose} title={t("projects.add")} wide>
      <NewProjectForm key={key} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function NewProjectForm({ onClose, onSaved }: { onClose: () => void; onSaved: (p: Project) => void }) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [due, setDue] = useState("");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState(SWATCHES[0]);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (name.trim().length < 2 || !customer || !due) {
      setError(t("projects.formInvalid"));
      return;
    }
    onSaved({ id: Date.now(), name: name.trim(), nameAr: name.trim(), customerId: Number(customer), stage: "planning", progress: 0, due, budget: Number(budget) || 0, color });
  };

  return (
    <div className="flex flex-col gap-4">
      <FormSection icon={<FolderKanban className="size-4" />} title={t("projects.form.basics")} hint={t("projects.form.basicsHint")}>
        <FormGrid>
          <TextField variant="secondary" isRequired value={name} onChange={setName}>
            <Label>{t("projects.fields.name")}</Label>
            <Input maxLength={120} />
          </TextField>
          <AppAutocomplete
            label={t("projects.fields.customer")}
            isRequired
            value={customer}
            onChange={setCustomer}
            options={CUSTOMERS.map((c) => ({ value: String(c.id), label: localName(c, i18n.language), description: c.email, searchText: `${c.name} ${c.nameAr}` }))}
          />
          <AppDatePicker label={t("projects.fields.due")} isRequired value={due} onChange={setDue} />
          <TextField variant="secondary" value={budget} onChange={setBudget} inputMode="decimal">
            <Label>
              {t("projects.fields.budget")} ({APP_DEFAULTS.currency})
            </Label>
            <Input dir="ltr" placeholder="0" />
          </TextField>
        </FormGrid>
      </FormSection>
      <FormSection title={t("projects.form.organise")}>
        <CreatableMultiPicker label={t("projects.fields.tags")} value={tags} onChange={setTags} options={["design", "urgent", "fit-out", "maintenance"].map((v) => ({ value: v, label: v }))} />
        <InlineSwatchPicker label={t("projects.fields.color")} value={color} colors={SWATCHES} onChange={setColor} />
      </FormSection>
      <FormFooter error={error}>
        <Button variant="tertiary" onPress={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onPress={submit}>{t("common.create")}</Button>
      </FormFooter>
    </div>
  );
}
