"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Input, Label, Popover, TextField, toast } from "@heroui/react";
import { Bookmark, BookmarkCheck, Star, StarOff, Trash2, RotateCcw, Save, Pencil, Check, X } from "lucide-react";
import type { FilterValues, ListFilters } from "@/hooks/useListFilters";
import { useInFilterSheet } from "@/components/ui/filter-sheet-context";

/**
 * Saved-filter presets for a list page (per user, stored in the DB through
 * useListFilters). Save the current filters under a name, re-apply, rename,
 * delete, and mark one preset as the default applied on every fresh visit.
 */
export function FilterPresets<T extends FilterValues>({ filters }: { filters: ListFilters<T> }) {
  const { t } = useTranslation();
  const { presets, dirty, reset } = filters;
  const inSheet = useInFilterSheet();
  const [name, setName] = useState("");
  const [asDefault, setAsDefault] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  function save() {
    if (!name.trim()) return;
    presets.save(name, asDefault);
    toast.success(t("filters.presets.saved"));
    setName("");
    setAsDefault(false);
  }

  const active = presets.activeId;

  return (
    <div className="flex items-center gap-1">
      {dirty && !inSheet && (
        <Button size="sm" variant="ghost" onPress={reset}>
          <RotateCcw className="size-3.5" />
          {t("filters.reset")}
        </Button>
      )}
      <Popover>
        <Popover.Trigger className="inline-flex">
          <Button size="sm" variant={active ? "secondary" : "ghost"} aria-label={t("filters.presets.title")}>
            {active ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            <span className={inSheet ? undefined : "hidden sm:inline"}>{active ? presets.list.find((p) => p.id === active)?.name : t("filters.presets.title")}</span>
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="bottom end" className="w-80 p-0">
          <Popover.Dialog aria-label={t("filters.presets.title")} className="p-0">
            <div className="border-b border-app-border px-3 py-2">
              <p className="text-sm font-semibold">{t("filters.presets.title")}</p>
              <p className="text-xs text-neutral-500">{t("filters.presets.hint")}</p>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {presets.list.length === 0 && <li className="px-3 py-4 text-center text-sm text-neutral-500">{t("filters.presets.empty")}</li>}
              {presets.list.map((p) => (
                <li key={p.id} className={`flex items-center gap-1 border-b border-app-border px-2 py-1.5 last:border-b-0 ${p.id === active ? "bg-sky-500/5" : ""}`}>
                  {renaming?.id === p.id ? (
                    <>
                      <TextField variant="secondary" aria-label={t("filters.presets.name")} value={renaming.name} onChange={(v) => setRenaming({ id: p.id, name: v })} className="flex-1"><Input /></TextField>
                      <Button size="sm" variant="ghost" isIconOnly aria-label={t("common.save")} onPress={() => { if (renaming.name.trim()) presets.rename(p.id, renaming.name); setRenaming(null); }}><Check className="size-4" /></Button>
                      <Button size="sm" variant="ghost" isIconOnly aria-label={t("common.cancel")} onPress={() => setRenaming(null)}><X className="size-4" /></Button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-start text-sm hover:bg-black/5 dark:hover:bg-white/5" onClick={() => presets.apply(p.id)}>
                        <span className="truncate font-medium">{p.name}</span>
                        {p.id === presets.defaultId && <span className="shrink-0 rounded bg-amber-500/15 px-1 text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300">{t("filters.presets.default")}</span>}
                      </button>
                      <Button size="sm" variant="ghost" isIconOnly aria-label={p.id === presets.defaultId ? t("filters.presets.unsetDefault") : t("filters.presets.setDefault")} onPress={() => presets.setDefault(p.id === presets.defaultId ? null : p.id)}>
                        {p.id === presets.defaultId ? <StarOff className="size-4" /> : <Star className="size-4" />}
                      </Button>
                      {p.id === active && dirty === false ? null : (
                        <Button size="sm" variant="ghost" isIconOnly aria-label={t("filters.presets.updateWithCurrent")} isDisabled={!dirty || p.id === active} onPress={() => { presets.update(p.id); toast.success(t("filters.presets.saved")); }}><Save className="size-4" /></Button>
                      )}
                      <Button size="sm" variant="ghost" isIconOnly aria-label={t("filters.presets.rename")} onPress={() => setRenaming({ id: p.id, name: p.name })}><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" isIconOnly aria-label={t("common.delete")} onPress={() => presets.remove(p.id)}><Trash2 className="size-4 text-red-600" /></Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-app-border p-3">
              <TextField variant="secondary" value={name} onChange={setName} isDisabled={!dirty}>
                <Label>{t("filters.presets.saveCurrent")}</Label>
                <div className="flex gap-2">
                  <Input placeholder={t("filters.presets.namePlaceholder")} />
                  <Button size="sm" isDisabled={!dirty || !name.trim()} onPress={save}><Save className="size-4" /></Button>
                </div>
              </TextField>
              {!dirty && <p className="text-xs text-neutral-500">{t("filters.presets.changeFirst")}</p>}
              <Checkbox variant="secondary" isSelected={asDefault} isDisabled={!dirty} onChange={setAsDefault}>
                <Checkbox.Content className="flex items-center gap-2"><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><span className="text-xs">{t("filters.presets.makeDefault")}</span></Checkbox.Content>
              </Checkbox>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}
