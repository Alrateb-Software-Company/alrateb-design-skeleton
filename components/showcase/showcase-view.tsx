"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Blocks, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { FoundationsSection } from "./foundations";
import { ActionsSection } from "./actions";
import { FormsSection } from "./forms";
import { DataSection } from "./data";
import { OverlaysSection } from "./overlays";
import { LayoutSection } from "./layout";

const SECTIONS = ["foundations", "actions", "forms", "data", "overlays", "layout"] as const;

/** Living style guide: every shared component rendered with real props. Keep it in sync when adding to components/ui. */
export function ShowcaseView() {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>(SECTIONS[0]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const link = (id: string, compact = false) => (
    <a
      key={id}
      href={`#${id}`}
      className={
        compact
          ? `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${active === id ? "bg-accent text-white" : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300"}`
          : `block rounded-xl px-3 py-2 text-sm transition ${active === id ? "bg-sky-500/10 font-semibold text-sky-700 dark:text-sky-300" : "text-neutral-500 hover:bg-neutral-500/5 hover:text-neutral-800 dark:hover:text-neutral-200"}`
      }
    >
      {t(`showcase.sections.${id}`)}
    </a>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("showcase.title")} subtitle={t("showcase.subtitle")} icon={<Blocks className="size-5" />} />

      <nav aria-label={t("showcase.toc")} className="no-scrollbar sticky top-16 z-10 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-app-bg/85 px-4 py-2 backdrop-blur md:-mx-6 md:px-6 xl:hidden">
        {SECTIONS.map((id) => link(id, true))}
      </nav>

      <div className="flex gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <FoundationsSection />
          <ActionsSection />
          <FormsSection />
          <DataSection />
          <OverlaysSection />
          <LayoutSection />
        </div>
        <aside className="hidden w-52 shrink-0 xl:block">
          <nav aria-label={t("showcase.toc")} className="sticky top-24 flex flex-col gap-0.5">
            <p className="mb-1 flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              <BookOpen className="size-3.5" />
              {t("showcase.toc")}
            </p>
            {SECTIONS.map((id) => link(id))}
            <p className="mt-4 rounded-2xl bg-violet-500/10 p-3 text-xs leading-relaxed text-violet-700 dark:text-violet-300">{t("showcase.docsHint")}</p>
          </nav>
        </aside>
      </div>
    </div>
  );
}
