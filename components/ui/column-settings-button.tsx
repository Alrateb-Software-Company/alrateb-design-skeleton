"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInFilterSheet } from "@/components/ui/filter-sheet-context";
import { Button } from "@heroui/react";
import { Columns3, RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ColumnPicker } from "@/components/ui/column-picker";
import type { TableColumns } from "@/hooks/useTableColumns";

/** Toolbar button opening the per-user "Columns" dialog for a table driven by `useTableColumns`. */
export function ColumnSettingsButton({ table, size = "sm" }: { table: TableColumns; size?: "sm" | "md" }) {
  const inSheet = useInFilterSheet();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} variant={table.customized ? "secondary" : "ghost"} onPress={() => setOpen(true)} aria-label={t("columns.title")}>
        <Columns3 className="size-4" />
        <span className={inSheet ? undefined : "hidden sm:inline"}>{t("columns.title")}</span>
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("columns.title")}>
        <p className="mb-3 text-sm text-neutral-500">{t("columns.hint")}</p>
        <ColumnPicker items={table.pickerItems} value={table.selection} onChange={table.setSelection} />
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-app-border pt-4">
          <Button variant="ghost" size="sm" isDisabled={!table.customized} onPress={table.reset}><RotateCcw className="size-3.5" />{t("columns.reset")}</Button>
          <Button onPress={() => setOpen(false)}>{t("common.done")}</Button>
        </div>
      </Modal>
    </>
  );
}
