"use client";

import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { TINT, type Tint } from "@/components/ui/dashboard-blocks";
import { Example, Row, ShowcaseSection } from "./showcase-kit";

// Only these shades are rebranded in globals.css; 100/200/800/900 are stock Tailwind blue/purple.
const SHADES = [50, 300, 400, 500, 600, 700, 950] as const;
const TOKENS = [
  { name: "--accent", cls: "bg-accent", note: "bg-accent · text-accent" },
  { name: "--app-bg", cls: "bg-app-bg", note: "bg-app-bg" },
  { name: "--app-surface", cls: "bg-app-surface", note: "bg-app-surface" },
  { name: "--app-border", cls: "bg-app-border", note: "border-app-border" },
];
const STATUS = [
  { name: "emerald", cls: "bg-emerald-500", use: "success" },
  { name: "amber", cls: "bg-amber-500", use: "warning" },
  { name: "red", cls: "bg-red-500", use: "danger" },
  { name: "indigo", cls: "bg-indigo-500", use: "info" },
  { name: "neutral", cls: "bg-neutral-500", use: "muted" },
];

// Tailwind only ships classes it can see literally, so the scale classes are spelled out.
const SKY = ["bg-sky-50", "bg-sky-300", "bg-sky-400", "bg-sky-500", "bg-sky-600", "bg-sky-700", "bg-sky-950"];
const VIOLET = ["bg-violet-50", "bg-violet-300", "bg-violet-400", "bg-violet-500", "bg-violet-600", "bg-violet-700", "bg-violet-950"];

function Scale({ label, classes }: { label: string; classes: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <div className="grid grid-cols-7 overflow-hidden rounded-2xl">
        {classes.map((c, i) => (
          <div key={c} className={`flex h-14 items-end p-1.5 text-[10px] font-medium ${c} ${i >= 3 ? "text-white" : "text-neutral-800"}`}>
            {SHADES[i]}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FoundationsSection() {
  const { t } = useTranslation();
  return (
    <ShowcaseSection id="foundations" title={t("showcase.sections.foundations")} hint={t("showcase.hints.foundations")}>
      <Example title={t("showcase.ex.brand")} code={`<div className="bg-sky-500 text-white" />   // primary (teal)\n<div className="bg-violet-500" />          // secondary (gold)\n<Button className="bg-accent" />          // the brand accent token`}>
        <div className="flex flex-col gap-4">
          <Scale label={t("showcase.ex.primaryScale")} classes={SKY} />
          <Scale label={t("showcase.ex.secondaryScale")} classes={VIOLET} />
        </div>
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.surfaces")}>
          <div className="grid grid-cols-2 gap-3">
            {TOKENS.map((tk) => (
              <div key={tk.name} className="flex items-center gap-3">
                <span className={`size-10 shrink-0 rounded-xl ring-1 ring-black/10 dark:ring-white/10 ${tk.cls}`} />
                <span className="min-w-0">
                  <code className="block truncate text-xs font-semibold" dir="ltr">
                    {tk.name}
                  </code>
                  <span className="block truncate text-[11px] text-neutral-500" dir="ltr">
                    {tk.note}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Example>
        <Example title={t("showcase.ex.status")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {STATUS.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5">
                <span className={`size-8 shrink-0 rounded-lg ${s.cls}`} />
                <span>
                  <span className="block text-xs font-semibold">{s.name}</span>
                  <span className="block text-[11px] text-neutral-500">{s.use}</span>
                </span>
              </div>
            ))}
          </div>
        </Example>
      </div>

      <Example title={t("showcase.ex.tints")} code={`import { TINT } from "@/components/ui/dashboard-blocks";\n\n<span className={\`grid size-9 place-items-center rounded-2xl \${TINT.emerald}\`}>\n  <Building2 className="size-[18px]" />\n</span>`}>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(TINT) as Tint[]).map((k) => (
            <div key={k} className="flex flex-col items-center gap-1.5">
              <span className={`grid size-11 place-items-center rounded-2xl ${TINT[k]}`}>
                <Building2 className="size-5" />
              </span>
              <code className="text-[11px] text-neutral-500">{k}</code>
            </div>
          ))}
        </div>
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.type")}>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-bold tracking-tight">{t("showcase.type.h1")} · text-2xl bold</p>
            <p className="text-lg font-semibold">{t("showcase.type.h2")} · text-lg semibold</p>
            <p className="text-sm font-semibold">{t("showcase.type.h3")} · text-sm semibold</p>
            <p className="text-sm">{t("showcase.type.body")} · text-sm</p>
            <p className="text-xs text-neutral-500">{t("showcase.type.muted")} · text-xs neutral-500</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{t("showcase.type.overline")} · 11px uppercase</p>
            <p className="text-sm tabular-nums" dir="ltr">
              1,234.500 · tabular-nums
            </p>
          </div>
        </Example>
        <Example title={t("showcase.ex.shape")}>
          <div className="flex flex-col gap-4">
            <Row label="radius">
              {[
                ["rounded-lg", "inputs"],
                ["rounded-xl", "tiles"],
                ["rounded-2xl", "rows"],
                ["rounded-3xl", "cards"],
                ["rounded-full", "chips"],
              ].map(([r, use]) => (
                <div key={r} className="flex flex-col items-center gap-1">
                  <span className={`size-12 bg-sky-500/15 ring-1 ring-sky-500/30 ${r}`} />
                  <code className="text-[10px] text-neutral-500">{use}</code>
                </div>
              ))}
            </Row>
            <Row label="elevation">
              {["shadow-sm", "shadow-md", "shadow-lg"].map((s) => (
                <span key={s} className={`grid h-12 w-24 place-items-center rounded-2xl bg-app-surface text-[11px] text-neutral-500 ${s}`}>
                  {s}
                </span>
              ))}
            </Row>
          </div>
        </Example>
      </div>
    </ShowcaseSection>
  );
}
