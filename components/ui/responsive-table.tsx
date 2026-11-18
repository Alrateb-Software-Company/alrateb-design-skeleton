"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@heroui/react";

/**
 * Adaptive list layout — the design convention for every data table in the
 * dashboard: a HeroUI table while the container is wide enough to show all
 * columns, record cards as soon as the table would need horizontal scrolling
 * (phones, tablets in either orientation, a narrow content area next to the
 * sidebar). The switch is container-based, so collapsing the sidebar or
 * rotating a tablet re-evaluates it automatically.
 */

/** Width (px) below which the table would overflow. Tune per table; 720 fits ~6 columns. */
export const COMPACT_DEFAULT_MIN_WIDTH = 720;

export function useCompactLayout<T extends HTMLElement = HTMLDivElement>(minWidth = COMPACT_DEFAULT_MIN_WIDTH) {
  const ref = useRef<T>(null);
  // First paint guesses from the viewport; the observer corrects it before the browser paints.
  const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.innerWidth < minWidth);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? el.getBoundingClientRect().width;
      if (width > 0) setCompact(width < minWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [minWidth]);

  return { ref, compact };
}

export function ResponsiveTable({
  minWidth = COMPACT_DEFAULT_MIN_WIDTH,
  table,
  cards,
  className = "",
}: {
  /** Container width (px) under which `cards` replaces `table`. */
  minWidth?: number;
  table: ReactNode;
  cards: ReactNode;
  className?: string;
}) {
  const { ref, compact } = useCompactLayout<HTMLDivElement>(minWidth);
  return (
    <div ref={ref} data-layout={compact ? "cards" : "table"} className={`@container w-full min-w-0 ${className}`}>
      {compact ? cards : table}
    </div>
  );
}

/** Grid of record cards; one column on phones, two from ~36rem of container width. */
export function RecordCardList({
  children,
  selectAll,
  footer,
  className = "",
}: {
  children: ReactNode;
  /** Renders a select-all bar above the cards (mirrors the table header checkbox). */
  selectAll?: { total: number; selected: number; onChange: (all: boolean) => void };
  /** Pagination etc., rendered under the grid. */
  footer?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {selectAll && selectAll.total > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-app-surface px-3 py-2 shadow-sm">
          <Checkbox
            variant="secondary"
            isSelected={selectAll.selected > 0 && selectAll.selected >= selectAll.total}
            isIndeterminate={selectAll.selected > 0 && selectAll.selected < selectAll.total}
            onChange={(v) => selectAll.onChange(v)}
          >
            <Checkbox.Content className="flex items-center gap-2">
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <span className="text-xs font-medium">{t("common.selectAll")}</span>
            </Checkbox.Content>
          </Checkbox>
          <span className="text-xs tabular-nums text-neutral-500">
            {selectAll.selected > 0 ? t("common.selectedCount", { count: selectAll.selected }) : selectAll.total}
          </span>
        </div>
      ) : null}
      <div className="grid gap-3 @xl:grid-cols-2">{children}</div>
      {footer}
    </div>
  );
}

/**
 * One record. Header = optional checkbox + leading visual + title/subtitle + trailing
 * (status chips, actions menu); body = <RecordFields>/<RecordField> or free content.
 */
export function RecordCard({
  selected,
  onSelectedChange,
  selectLabel,
  selectDisabled,
  leading,
  title,
  subtitle,
  trailing,
  children,
  footer,
  tone = "default",
  className = "",
}: {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  selectLabel?: string;
  selectDisabled?: boolean;
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
}) {
  const selectable = typeof onSelectedChange === "function";
  const toneRing =
    tone === "danger"
      ? "ring-1 ring-red-500/30"
      : tone === "warning"
        ? "ring-1 ring-amber-500/30"
        : tone === "success"
          ? "ring-1 ring-emerald-500/30"
          : "";
  return (
    <article
      data-selected={selected ? "" : undefined}
      className={`relative flex min-w-0 flex-col gap-3 rounded-2xl bg-app-surface p-4 shadow-sm transition-shadow ${toneRing} ${
        selected ? "ring-2 ring-app-primary/40" : ""
      } ${className}`}
    >
      <header className="flex items-start gap-3">
        {selectable ? (
          <Checkbox variant="secondary" isSelected={!!selected} isDisabled={selectDisabled} onChange={onSelectedChange} aria-label={selectLabel} className="mt-0.5 shrink-0">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Content>
          </Checkbox>
        ) : null}
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="min-w-0 text-sm font-semibold leading-snug">{title}</div>
          {subtitle ? <div className="mt-0.5 min-w-0 text-xs text-neutral-500">{subtitle}</div> : null}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-1.5">{trailing}</div> : null}
      </header>
      {children}
      {footer ? <footer className="flex flex-wrap items-center gap-2 border-t border-app-border pt-3">{footer}</footer> : null}
    </article>
  );
}

/** Label/value grid for a card body. */
export function RecordFields({ children, columns = 2, className = "" }: { children: ReactNode; columns?: 1 | 2 | 3; className?: string }) {
  const cols = columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-2 @sm:grid-cols-3" : "grid-cols-2";
  return <dl className={`grid gap-x-4 gap-y-2.5 ${cols} ${className}`}>{children}</dl>;
}

export function RecordField({ label, children, span, className = "" }: { label: ReactNode; children: ReactNode; span?: boolean; className?: string }) {
  return (
    <div className={`min-w-0 ${span ? "col-span-full" : ""} ${className}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="mt-0.5 min-w-0 text-sm">{children}</dd>
    </div>
  );
}
