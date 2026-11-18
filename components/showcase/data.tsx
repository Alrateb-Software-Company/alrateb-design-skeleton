"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip } from "@heroui/react";
import { ArrowRight, Phone } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { RecordCard, RecordCardList, RecordField, RecordFields } from "@/components/ui/responsive-table";
import { ChipRow } from "@/components/ui/filter-bar";
import { FilterChip } from "@/components/ui/filter-chip";
import { FilterAutocomplete, FilterMultiSelect, FilterSelect } from "@/components/ui/filter-select";
import { ListPagination } from "@/components/ui/list-pagination";
import { Money, CurrencySymbol } from "@/components/ui/money";
import { NeedsAttentionBar, GapBadges } from "@/components/ui/needs-attention";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LinkButton } from "@/components/ui/link-button";
import { CITIES, CUSTOMERS, localName } from "@/lib/demo-data";
import { Example, Row, ShowcaseSection } from "./showcase-kit";

const GAPS = ["noPhone", "noEmail", "overdue"] as const;
const GAP_TONE = { noPhone: "warning", noEmail: "warning", overdue: "danger" } as const;

export function DataSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [chips, setChips] = useState<Set<string>>(new Set(["muscat"]));
  const [status, setStatus] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [customer, setCustomer] = useState("");
  const [page, setPage] = useState(3);
  const [gap, setGap] = useState("");
  const sample = CUSTOMERS.slice(0, 4);
  const cityOptions = CITIES.map((c) => ({ value: c, label: t(`customers.cities.${c}`) }));
  const gapLabel = (g: string) => t(`showcase.gaps.${g}`);

  return (
    <ShowcaseSection id="data" title={t("showcase.sections.data")} hint={t("showcase.hints.data")}>
      <Example
        title={t("showcase.ex.dataTable")}
        code={`<DataTable<number>
  framed
  ariaLabel="Customers"
  columns={[{ key: "name", label: "Name", isRowHeader: true, cardTitle: true }, ...]}
  rows={rows.map((r) => ({ key: r.id, tone: r.overdue ? "danger" : undefined, cells: { name: r.name, ... } }))}
  selection={{ selected, onChange: setSelected, labelOf: (id) => ... }}
  emptyState={<EmptyState ... />}
  footer={<ListPagination ... />}
/>`}
      >
        <div className="flex flex-col gap-3">
          <DataTable<number>
            ariaLabel={t("customers.title")}
            columns={[
              { key: "name", label: t("customers.fields.name"), isRowHeader: true, cardTitle: true },
              { key: "city", label: t("customers.fields.city"), cardSubtitle: true },
              { key: "balance", label: t("customers.fields.balance") },
              { key: "status", label: t("common.status"), cardTrailing: true },
            ]}
            selection={{ selected, onChange: setSelected, labelOf: (id) => CUSTOMERS.find((c) => c.id === id)?.name ?? "" }}
            rows={sample.map((c) => ({
              key: c.id,
              tone: c.balance < 0 ? ("danger" as const) : undefined,
              cells: {
                name: (
                  <span className="flex items-center gap-2.5 font-medium">
                    <UserAvatar name={c.name} size="sm" />
                    {localName(c, lang)}
                  </span>
                ),
                city: t(`customers.cities.${c.city}`),
                balance: <Money amount={c.balance} currency="OMR" className={c.balance < 0 ? "text-red-600 dark:text-red-400" : ""} />,
                status: (
                  <Chip size="sm" variant="soft" color={c.status === "active" ? "success" : c.status === "lead" ? "accent" : "default"}>
                    <Chip.Label>{t(`customers.status.${c.status}`)}</Chip.Label>
                  </Chip>
                ),
              },
            }))}
          />
          <p className="text-xs text-neutral-500">{t("showcase.demo.tableNote")}</p>
          <LinkButton href="/dashboard/customers" variant="secondary" size="sm" className="self-start">
            {t("showcase.demo.fullExample")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </LinkButton>
        </div>
      </Example>

      <Example title={t("showcase.ex.recordCards")} code={`<RecordCardList>\n  <RecordCard leading={<UserAvatar ... />} title="..." subtitle="..." trailing={<Chip />} tone="warning">\n    <RecordFields><RecordField label="City">Muscat</RecordField></RecordFields>\n  </RecordCard>\n</RecordCardList>`}>
        <RecordCardList className="sm:grid-cols-2">
          {sample.slice(0, 2).map((c, i) => (
            <RecordCard
              key={c.id}
              tone={i === 1 ? "warning" : "default"}
              leading={<UserAvatar name={c.name} size="sm" />}
              title={localName(c, lang)}
              subtitle={<span dir="ltr">{c.email}</span>}
              trailing={
                <Chip size="sm" variant="soft" color="success">
                  <Chip.Label>{t(`customers.status.${c.status}`)}</Chip.Label>
                </Chip>
              }
            >
              <RecordFields>
                <RecordField label={t("customers.fields.city")}>{t(`customers.cities.${c.city}`)}</RecordField>
                <RecordField label={t("customers.fields.balance")}>
                  <Money amount={c.balance} currency="OMR" />
                </RecordField>
                <RecordField label={t("customers.fields.phone")} span>
                  <span className="flex items-center gap-1" dir="ltr">
                    <Phone className="size-3" />
                    {c.phone}
                  </span>
                </RecordField>
              </RecordFields>
            </RecordCard>
          ))}
        </RecordCardList>
      </Example>

      <Example
        title={t("showcase.ex.filters")}
        code={`<FilterBar filters={filters} search={<SearchField ... />} tools={<FilterPresets filters={filters} />}>
  <FilterSelect ariaLabel="Status" allLabel="All statuses" value={f.status} onChange={(v) => filters.set("status", v)} options={...} />
  <FilterMultiSelect label="Cities" value={f.cities} onChange={...} options={...} />
</FilterBar>
<ChipRow><FilterChip label="Muscat" isSelected={on} onChange={setOn} /></ChipRow>`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <FilterSelect ariaLabel={t("common.status")} allLabel={t("customers.allStatuses")} value={status} onChange={setStatus} options={["active", "lead", "inactive"].map((s) => ({ value: s, label: t(`customers.status.${s}`) }))} className="w-44" />
            <FilterMultiSelect label={t("customers.fields.city")} value={cities} onChange={setCities} options={cityOptions} />
            <FilterAutocomplete ariaLabel={t("nav.customers")} allLabel={t("showcase.demo.allCustomers")} value={customer} onChange={setCustomer} options={CUSTOMERS.map((c) => ({ value: String(c.id), label: localName(c, lang) }))} className="w-56" />
          </div>
          <ChipRow label={t("customers.fields.city")}>
            {CITIES.map((c) => (
              <FilterChip
                key={c}
                label={t(`customers.cities.${c}`)}
                isSelected={chips.has(c)}
                onChange={(on) =>
                  setChips((s) => {
                    const n = new Set(s);
                    if (on) n.add(c);
                    else n.delete(c);
                    return n;
                  })
                }
              />
            ))}
          </ChipRow>
        </div>
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.attention")} code={`<NeedsAttentionBar order={GAPS} counts={counts} value={gap} onChange={setGap}\n  labelOf={(g) => t(\`gaps.\${g}\`)} toneOf={(g) => TONE[g]} />\n<GapBadges gaps={row.gaps} labelOf={...} toneOf={...} />`}>
          <div className="flex flex-col gap-4">
            <NeedsAttentionBar order={GAPS} counts={{ noPhone: 4, noEmail: 2, overdue: 1 }} value={gap} onChange={setGap} labelOf={gapLabel} toneOf={(g) => GAP_TONE[g as keyof typeof GAP_TONE]} />
            <Row label="GapBadges">
              <GapBadges gaps={["overdue", "noPhone", "noEmail"]} labelOf={gapLabel} toneOf={(g) => GAP_TONE[g as keyof typeof GAP_TONE]} />
            </Row>
          </div>
        </Example>
        <Example title={t("showcase.ex.money")} code={`<Money amount={1250.5} currency="OMR" />\n<CurrencySymbol currency="SAR" />   // official glyphs for SAR / AED / OMR…`}>
          <div className="flex flex-col gap-2 text-sm">
            <Row>
              <Money amount={1250.5} currency="OMR" className="text-lg font-semibold" />
              <Money amount={-320} currency="OMR" className="text-lg font-semibold text-red-600 dark:text-red-400" />
              <Money amount={89990} currency="SAR" minFractionDigits={0} maxFractionDigits={0} className="text-lg font-semibold" />
              <Money amount={4200} currency="AED" className="text-lg font-semibold" />
            </Row>
            <Row label="CurrencySymbol">
              {["OMR", "SAR", "AED", "USD"].map((c) => (
                <span key={c} className="grid size-9 place-items-center rounded-xl bg-neutral-500/10 text-base">
                  <CurrencySymbol currency={c} />
                </span>
              ))}
            </Row>
          </div>
        </Example>
      </div>

      <Example title={t("showcase.ex.pagination")} code={`<ListPagination page={page} totalPages={12} onChange={setPage} />`}>
        <ListPagination page={page} totalPages={12} onChange={setPage} />
      </Example>
    </ShowcaseSection>
  );
}
