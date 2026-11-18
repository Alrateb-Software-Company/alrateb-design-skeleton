"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, SearchField, toast } from "@heroui/react";
import { icons, Shapes, type LucideIcon } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Example, Row } from "@/components/showcase/showcase-kit";

const ALL = Object.entries(icons) as [string, LucideIcon][];
const STEP = 240;
const SIZES = [
  { cls: "size-3.5", use: "chips, inline meta" },
  { cls: "size-4", use: "buttons, menus, inputs" },
  { cls: "size-[18px]", use: "tiles, nav items" },
  { cls: "size-5", use: "page headers, topbar" },
  { cls: "size-6", use: "empty states" },
];
// Icons that point "forward/back" must mirror in Arabic.
const DIRECTIONAL = ["ChevronRight", "ArrowRight", "ChevronLeft", "ArrowLeft"] as const;

/** Searchable gallery of the lucide-react set (the only icon library used in our apps). Click to copy JSX. */
export function IconsView() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(STEP);
  const query = useDeferredValue(q.trim().toLowerCase().replace(/[\s-]/g, ""));
  const matches = useMemo(() => (query ? ALL.filter(([name]) => name.toLowerCase().includes(query)) : ALL), [query]);
  const shown = matches.slice(0, limit);

  const copy = async (name: string) => {
    await navigator.clipboard.writeText(`<${name} className="size-4" />`);
    toast.success(t("icons.copied", { name }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("icons.title")} subtitle={t("icons.subtitle", { count: ALL.length })} icon={<Shapes className="size-5" />} />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Example title={t("icons.usage")} code={`import { Users, ChevronRight } from "lucide-react";\n\n<Users className="size-4" />\n<ChevronRight className="size-4 rtl:rotate-180" />   // directional icons mirror in RTL`}>
          <Row>
            {SIZES.map(({ cls, use }) => {
              const Icon = icons.Users;
              return (
                <div key={cls} className="flex flex-col items-center gap-1.5 rounded-2xl bg-neutral-500/5 px-3 py-2.5">
                  <Icon className={cls} />
                  <code className="text-[10px] font-semibold" dir="ltr">
                    {cls}
                  </code>
                  <span className="text-[10px] text-neutral-500">{use}</span>
                </div>
              );
            })}
          </Row>
        </Example>
        <Example title={t("icons.rtl")}>
          <p className="mb-3 text-sm text-neutral-500">{t("icons.rtlHint")}</p>
          <Row>
            {DIRECTIONAL.map((n) => {
              const Icon = icons[n];
              return (
                <span key={n} className="flex items-center gap-1.5 rounded-xl bg-neutral-500/5 px-2.5 py-1.5 text-xs">
                  <Icon className="size-4 rtl:rotate-180" />
                  <code dir="ltr">{n}</code>
                </span>
              );
            })}
          </Row>
        </Example>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchField aria-label={t("icons.search")} value={q} onChange={(v) => { setQ(v); setLimit(STEP); }} className="w-full sm:w-80">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t("icons.search")} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <span className="text-sm text-neutral-500">{t("icons.results", { count: matches.length })}</span>
      </div>

      {matches.length === 0 ? (
        <EmptyState icon={<Shapes className="size-6" />} title={t("common.noMatches")} hint={t("icons.noMatchesHint")} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {shown.map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => copy(name)}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-app-surface px-1 py-3 shadow-sm outline-none transition hover:bg-sky-500/10 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-accent active:scale-95 dark:hover:text-sky-300"
              >
                <Icon className="size-5" />
                <span className="w-full truncate px-1 text-center text-[10px] text-neutral-500 group-hover:text-inherit" dir="ltr">
                  {name}
                </span>
              </button>
            ))}
          </div>
          {shown.length < matches.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onPress={() => setLimit((l) => l + STEP * 2)}>
                {t("icons.showMore", { count: matches.length - shown.length })}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
