"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, ListBox } from "@heroui/react";
import { useDragAndDrop } from "react-aria-components";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { AppSwitch } from "@/components/ui/app-switch";
import { resolveColumns } from "@/lib/columns";

export interface PickerItem {
  key: string;
  label: ReactNode;
  /** Plain-text label for drag previews / screen readers. */
  text: string;
  /** Always included and not toggleable (e.g. the row-header column). */
  locked?: boolean;
}

export interface ColumnSelection { order: string[]; hidden: string[] }

/**
 * Reorderable show/hide list used by both the table "Columns" dialog and the
 * export dialog: drag the grip (mouse, touch long-press or keyboard) to
 * reorder, flip the switch to include/exclude. Up/down buttons are a
 * keyboard/mobile fallback for the drag handle.
 */
export function ColumnPicker({ items, value, onChange, maxHeight = "max-h-[50vh]" }: { items: PickerItem[]; value: ColumnSelection; onChange: (next: ColumnSelection) => void; maxHeight?: string }) {
  const { t } = useTranslation();
  const ordered = resolveColumns(items, value.order, []);
  const hidden = new Set(value.hidden);
  const keys = ordered.map((i) => i.key);

  const commitOrder = (next: string[]) => onChange({ order: next, hidden: value.hidden });
  const move = (key: string, delta: number) => {
    const i = keys.indexOf(key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= keys.length) return;
    const next = [...keys];
    [next[i], next[j]] = [next[j], next[i]];
    commitOrder(next);
  };
  const toggle = (key: string, on: boolean) => onChange({ order: keys, hidden: on ? value.hidden.filter((k) => k !== key) : [...value.hidden.filter((k) => k !== key), key] });

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (dragKeys) => [...dragKeys].map((k) => ({ "text/plain": items.find((i) => i.key === String(k))?.text ?? String(k) })),
    onReorder(e) {
      const moving = [...e.keys].map(String);
      const rest = keys.filter((k) => !moving.includes(k));
      const at = rest.indexOf(String(e.target.key));
      const idx = e.target.dropPosition === "after" ? at + 1 : at;
      commitOrder([...rest.slice(0, idx), ...moving, ...rest.slice(idx)]);
    },
  });

  const visibleCount = ordered.filter((i) => !hidden.has(i.key)).length;
  // React Aria caches each rendered item by object identity, so the row state
  // must live on the item itself (plus `dependencies`) or switches go stale.
  const rows = ordered.map((item, index) => ({ ...item, index, on: !!item.locked || !hidden.has(item.key), first: index === 0, last: index === ordered.length - 1 }));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{t("columns.selectedCount", { count: visibleCount, total: ordered.length })}</span>
        <span className="flex gap-1">
          <Button size="sm" variant="ghost" onPress={() => onChange({ order: keys, hidden: [] })}>{t("columns.all")}</Button>
          <Button size="sm" variant="ghost" onPress={() => onChange({ order: keys, hidden: ordered.filter((i) => !i.locked).map((i) => i.key) })}>{t("columns.none")}</Button>
        </span>
      </div>
      <ListBox aria-label={t("columns.title")} selectionMode="none" dragAndDropHooks={dragAndDropHooks} items={rows} dependencies={[rows]} className={`${maxHeight} overflow-y-auto rounded-xl border border-app-border bg-neutral-500/5 p-1`}>
        {(item) => (
          <ListBox.Item id={item.key} textValue={item.text} className="group mb-1 flex items-center gap-2 rounded-lg bg-app-surface px-2 py-1.5 last:mb-0 data-[dragging]:opacity-50">
            <span className="cursor-grab text-neutral-400 group-data-[dragging]:cursor-grabbing" aria-hidden><GripVertical className="size-4" /></span>
            <span className={`min-w-0 flex-1 truncate text-sm ${item.on ? "" : "text-neutral-400"}`}>{item.label || item.text}</span>
            <span className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" isIconOnly aria-label={t("columns.moveUp")} isDisabled={item.first} onPress={() => move(item.key, -1)}><ChevronUp className="size-3.5" /></Button>
              <Button size="sm" variant="ghost" isIconOnly aria-label={t("columns.moveDown")} isDisabled={item.last} onPress={() => move(item.key, 1)}><ChevronDown className="size-3.5" /></Button>
            </span>
            <AppSwitch size="sm" label="" isSelected={item.on} isDisabled={item.locked} onChange={(v) => toggle(item.key, v)} />
          </ListBox.Item>
        )}
      </ListBox>
    </div>
  );
}
