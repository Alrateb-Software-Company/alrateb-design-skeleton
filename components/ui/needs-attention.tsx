"use client";

import { Chip } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export type GapTone = "danger" | "warning";

/**
 * Needs-attention bar: one chip per gap with its count for the current filters; a chip filters the list to it.
 * Gaps with nothing to show are hidden (the selected one always shows so it can be cleared).
 */
export function NeedsAttentionBar({ order, counts, value, onChange, labelOf, toneOf }: {
  order: readonly string[];
  counts: Record<string, number> | undefined;
  value: string;
  onChange: (gap: string) => void;
  labelOf: (gap: string) => string;
  toneOf: (gap: string) => GapTone;
}) {
  const { t } = useTranslation();
  if (!counts) return null;
  const shown = order.filter((g) => (counts[g] ?? 0) > 0 || g === value);
  if (!shown.length) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />{t("common.attention.allClear")}
      </p>
    );
  }
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto max-md:-my-1 max-md:py-1 md:flex-wrap" role="group" aria-label={t("common.attention.title")}>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
        <AlertTriangle className="size-3.5" />{t("common.attention.title")}
      </span>
      {shown.map((g) => {
        const active = g === value;
        const tone = toneOf(g);
        const base = tone === "danger"
          ? (active ? "bg-red-600 text-white" : "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300")
          : (active ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300");
        return (
          <button key={g} type="button" aria-pressed={active} onClick={() => onChange(active ? "" : g)}
            className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${base}`}>
            {labelOf(g)} · {counts[g] ?? 0}
            {active && <X className="size-3" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

/** A row's gaps as small chips (the first few, then +N with the rest in the tooltip). */
export function GapBadges({ gaps, labelOf, toneOf, max = 2 }: { gaps: readonly string[]; labelOf: (gap: string) => string; toneOf: (gap: string) => GapTone; max?: number }) {
  if (!gaps.length) return null;
  const sorted = [...gaps].sort((a, b) => (toneOf(a) === toneOf(b) ? 0 : toneOf(a) === "danger" ? -1 : 1));
  const rest = sorted.slice(max);
  return (
    <span className="flex min-w-36 flex-wrap gap-1">
      {sorted.slice(0, max).map((g) => (
        <Chip key={g} size="sm" variant="soft" color={toneOf(g)} className="whitespace-nowrap"><Chip.Label>{labelOf(g)}</Chip.Label></Chip>
      ))}
      {rest.length > 0 && (
        <span title={rest.map(labelOf).join("\n")}>
          <Chip size="sm" variant="soft"><Chip.Label>+{rest.length}</Chip.Label></Chip>
        </span>
      )}
    </span>
  );
}
