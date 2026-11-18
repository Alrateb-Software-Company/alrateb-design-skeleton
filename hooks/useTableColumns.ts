"use client";

import { useCallback, useMemo } from "react";
import type { DataTableColumn } from "@/components/ui/data-table";
import { useUserPreference } from "@/hooks/useUserPreference";
import { resolveColumns } from "@/lib/columns";
import type { ColumnSelection } from "@/components/ui/column-picker";

export interface TableColumnDef extends DataTableColumn {
  /** Cannot be hidden (row header / primary identifier); always stays first unless moved. */
  locked?: boolean;
  /** Hidden until the user turns it on. */
  defaultHidden?: boolean;
  /** Plain-text label for the Columns dialog (defaults to `label` when it is a string). */
  text?: string;
}

const EMPTY: ColumnSelection = { order: [], hidden: [] };

/**
 * Per-user column visibility + order for a dashboard table, stored as the
 * `table.<tableKey>` user preference. Returns the visible, ordered `DataTable`
 * columns plus what the Columns dialog needs.
 */
export function useTableColumns(tableKey: string, defs: TableColumnDef[]) {
  const [stored, setStored] = useUserPreference<ColumnSelection>(`table.${tableKey}`, EMPTY);
  const defaultHidden = useMemo(() => defs.filter((d) => d.defaultHidden).map((d) => d.key), [defs]);
  const selection: ColumnSelection = useMemo(() => {
    const customized = stored.order.length > 0 || stored.hidden.length > 0;
    return customized ? stored : { order: [], hidden: defaultHidden };
  }, [stored, defaultHidden]);

  const columns = useMemo(() => {
    const lockedKeys = defs.filter((d) => d.locked).map((d) => d.key);
    return resolveColumns(defs, selection.order, selection.hidden.filter((k) => !lockedKeys.includes(k)));
  }, [defs, selection]);

  const setSelection = useCallback((next: ColumnSelection) => {
    // Storing an explicit empty "hidden" keeps the user's "show everything" choice distinct from the defaults.
    setStored({ order: next.order, hidden: next.hidden });
  }, [setStored]);
  const reset = useCallback(() => setStored(EMPTY), [setStored]);

  const pickerItems = useMemo(() => defs.map((d) => ({ key: d.key, label: d.label, text: d.text ?? (typeof d.label === "string" ? d.label : d.key), locked: d.locked })), [defs]);
  const customized = stored.order.length > 0 || stored.hidden.length > 0;

  return { columns, selection, setSelection, reset, pickerItems, customized };
}

export type TableColumns = ReturnType<typeof useTableColumns>;
