"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";
import { SlidersHorizontal } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FilterSheetContext, useInFilterSheet } from "@/components/ui/filter-sheet-context";
import type { FilterValues, ListFilters } from "@/hooks/useListFilters";

export { useInFilterSheet };

// Search stays visible on mobile, so it doesn't count towards the badge.
const UNCOUNTED = new Set(["q", "search", "page"]);

/**
 * Responsive list toolbar. From `md` up everything renders inline in one
 * wrapping row (search, filters, tools, then actions pushed to the end). On
 * phones only the search box, a "Filters" button (with an active-count badge)
 * and the actions stay in the row; filters and tools move into a bottom sheet
 * where every control is full width with its label.
 *
 * - `search`   — search field, always visible (fills the row on phones).
 * - `children` — filter controls (FilterSelect, FilterMultiSelect, SortSelect, date pickers, FilterGroup…).
 * - `tools`    — secondary buttons (presets, columns, export, import): inline on desktop, in the sheet on phones.
 * - `actions`  — primary buttons (Add…), always visible.
 * - `filters`  — a useListFilters result: derives the badge count and "Clear all" automatically.
 */
export function FilterBar<T extends FilterValues>({
  search,
  children,
  tools,
  actions,
  filters,
  activeCount,
  onClear,
  resultCount,
  label,
  icon,
  doneLabel,
  className,
}: {
  search?: ReactNode;
  children?: ReactNode;
  tools?: ReactNode;
  actions?: ReactNode;
  filters?: ListFilters<T>;
  /** Number of active filters for the badge (overrides the count derived from `filters`). */
  activeCount?: number;
  /** Clears the filters (defaults to `filters.reset`). */
  onClear?: () => void;
  /** Shown on the sheet's "Show results" button. */
  resultCount?: number;
  /** Mobile button text and sheet title (default "Filters"), e.g. for view switchers. */
  label?: string;
  icon?: ReactNode;
  /** Sheet confirm button text (default "Show results"). */
  doneLabel?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const title = label || t("filters.title");
  const count = activeCount ?? (filters ? filters.activeKeys.filter((k) => !UNCOUNTED.has(k)).length : 0);
  const clear = onClear ?? filters?.reset;
  const canClear = activeCount !== undefined || !filters ? count > 0 : filters.dirty;
  const hasSheet = hasContent(children) || hasContent(tools);

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
        {search && <div className="flex min-w-0 flex-1 items-center md:flex-none max-md:*:w-full! max-md:*:max-w-none!">{search}</div>}
        {hasSheet && (
          <div className="hidden md:contents">
            {children}
            {tools}
          </div>
        )}
        {hasSheet && (
          <Button variant="secondary" className="shrink-0 md:hidden" onPress={() => setOpen(true)}
            aria-label={count > 0 ? `${title} · ${t("filters.activeCount", { count })}` : title}>
            {icon ?? <SlidersHorizontal className="size-4" />}
            {title}
            {count > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold leading-5 text-white tabular-nums">{count}</span>}
          </Button>
        )}
        {hasContent(actions) && <div className={`ms-auto flex flex-wrap items-center gap-2 ${search ? "max-md:basis-full max-md:*:flex-1" : ""}`}>{actions}</div>}
      </div>

      {hasSheet && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          footer={
            <div className="flex gap-2">
              {clear && <Button variant="tertiary" className="flex-1" isDisabled={!canClear} onPress={clear}>{t("filters.clearAll")}</Button>}
              <Button className="flex-1" onPress={() => setOpen(false)}>
                {doneLabel || t("filters.showResults")}
                {resultCount !== undefined && <span className="tabular-nums opacity-80">({resultCount})</span>}
              </Button>
            </div>
          }
        >
          <FilterSheetContext.Provider value={true}>
            {hasContent(children) && <div className="grid grid-cols-1 gap-4 pb-1 sm:grid-cols-2 *:w-full! *:min-w-0 *:max-w-none!">{children}</div>}
            {hasContent(tools) && (
              <div className={hasContent(children) ? "mt-5 border-t border-app-border pt-4" : undefined}>
                <p className="mb-2 text-xs font-medium text-neutral-500">{t("filters.more")}</p>
                <div className="flex flex-wrap items-center gap-2">{tools}</div>
              </div>
            )}
          </FilterSheetContext.Provider>
        </Modal>
      )}
    </>
  );
}

/**
 * A labelled group of chips/toggles inside a FilterBar. Inline (no label) on
 * desktop; a titled, wrapping block in the mobile sheet.
 */
export function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  const sheet = useInFilterSheet();
  if (!sheet) return <>{children}</>;
  return (
    <div role="group" aria-label={label} className="sm:col-span-2">
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * A row of quick-filter chips (status counts, categories). Wraps on desktop;
 * one horizontally scrolling line on phones so it never stacks into a wall.
 */
export function ChipRow({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div role={label ? "group" : undefined} aria-label={label}
      className={`no-scrollbar flex items-center gap-2 overflow-x-auto *:shrink-0 *:whitespace-nowrap max-md:-my-1 max-md:py-1 md:flex-wrap ${className ?? ""}`}>
      {children}
    </div>
  );
}

function hasContent(node: ReactNode): boolean {
  if (node === null || node === undefined || node === false || node === true || node === "") return false;
  if (Array.isArray(node)) return node.some(hasContent);
  return true;
}
