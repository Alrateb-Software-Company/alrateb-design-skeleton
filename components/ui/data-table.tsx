"use client";

import type { KeyboardEvent, ReactNode, SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Surface, Table, type Selection } from "@heroui/react";
import { RecordCard, RecordCardList, RecordField, RecordFields, ResponsiveTable } from "@/components/ui/responsive-table";

type RowKey = string | number;

const INTERACTIVE = "a[href],button,input,select,textarea,[role=button],[role=link],[contenteditable=true]";
const fromInteractive = (e: SyntheticEvent) => {
  const el = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
  return !!el && e.currentTarget.contains(el);
};
// Selectable rows toggle on press; native links/buttons inside a cell (HeroUI ones stop propagation themselves) shouldn't.
const isolate = (e: SyntheticEvent) => {
  if (fromInteractive(e)) e.stopPropagation();
};
const isolateKeys = (e: KeyboardEvent) => {
  if ((e.key === "Enter" || e.key === " ") && fromInteractive(e)) e.stopPropagation();
};

/**
 * Row selection (HeroUI's built-in table selection: a checkbox column, select-all
 * in the header, click / Space on a row toggles it). `selected` may hold keys of
 * rows on other pages — they're kept when the visible rows are (de)selected.
 */
export interface DataTableSelection<K extends RowKey = RowKey> {
  selected: ReadonlySet<K>;
  onChange: (next: Set<K>) => void;
  /** Rows that can't be selected (e.g. already applied). */
  disabledKeys?: Iterable<K>;
  /** Accessible name of a row's checkbox in the card layout (the table appends the row header itself). */
  labelOf?: (key: K) => string;
}

export interface DataTableColumn {
  key: string;
  label: ReactNode;
  /** Card layout only: field label when the column header carries extra (table-wide) content. */
  cardLabel?: ReactNode;
  isRowHeader?: boolean;
  /** Hide this column from the card body (e.g. actions rendered as `trailing`). */
  hideInCard?: boolean;
  /** Column used as the card title (defaults to the row-header column). */
  cardTitle?: boolean;
  cardSubtitle?: boolean;
  /** Render as card trailing content (status chips / actions). */
  cardTrailing?: boolean;
  /** Card layout only: the field takes the card's full width (inline pickers / long content). */
  cardSpan?: boolean;
  className?: string;
}

export interface DataTableRow {
  key: string | number;
  cells: Record<string, ReactNode>;
  tone?: "default" | "warning" | "danger" | "success";
  /** Table layout only: extra classes on the row (e.g. a tint that ties related rows together). */
  className?: string;
  /** Card layout only: extra classes on the card. */
  cardClassName?: string;
  /** Card layout only: replaces the trailing columns (e.g. icon actions when text actions move to the footer). */
  cardTrailing?: ReactNode;
  /** Card layout only: content under the card body (text links / buttons that don't fit the header). */
  cardFooter?: ReactNode;
}

/**
 * Columns/rows convenience layer over ResponsiveTable: a HeroUI table on wide
 * containers and RecordCards on narrow ones, from one row definition.
 */
export function DataTable<K extends RowKey = RowKey>({
  ariaLabel,
  columns,
  rows,
  minWidth,
  emptyState,
  footer,
  framed,
  selection,
}: {
  ariaLabel: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  minWidth?: number;
  emptyState?: ReactNode;
  footer?: ReactNode;
  /** Wrap the wide-table layout in a white card so it contrasts with the page background. */
  framed?: boolean;
  selection?: DataTableSelection<K>;
}) {
  const { t } = useTranslation();
  if (rows.length === 0 && emptyState) return <>{emptyState}</>;

  const titleCol = columns.find((c) => c.cardTitle) ?? columns.find((c) => c.isRowHeader) ?? columns[0];
  const subtitleCol = columns.find((c) => c.cardSubtitle);
  const trailingCols = columns.filter((c) => c.cardTrailing);
  const bodyCols = columns.filter((c) => c !== titleCol && c !== subtitleCol && !c.cardTrailing && !c.hideInCard && c.label);

  const rowKeys = rows.map((r) => r.key as K);
  const disabled = new Set<K>(selection?.disabledKeys ?? []);
  const selectable = rowKeys.filter((k) => !disabled.has(k));
  const offPage = () => [...(selection?.selected ?? [])].filter((k) => !rowKeys.includes(k));
  const setVisible = (visible: Iterable<K>) => selection?.onChange(new Set([...offPage(), ...visible]));
  // The table only sees this page's keys, so every change is merged with the selection from other pages.
  const onSelectionChange = (keys: Selection) => setVisible(keys === "all" ? selectable : (keys as Set<K>));
  const selectBox = (label: string, variant?: "secondary") => (
    <Checkbox aria-label={label} slot="selection" variant={variant}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  );

  const table = (
    <>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label={ariaLabel}
            {...(selection ? {
              selectionMode: "multiple" as const,
              selectedKeys: new Set(rowKeys.filter((k) => selection.selected.has(k))),
              onSelectionChange,
              disabledKeys: [...disabled],
              disabledBehavior: "selection" as const,
            } : {})}
          >
            <Table.Header>
              {selection ? <Table.Column className="w-8 pe-0">{selectBox(t("common.selectAll"))}</Table.Column> : null}
              {columns.map((c) => (
                <Table.Column key={c.key} isRowHeader={c.isRowHeader} className={c.className}>
                  {c.label || " "}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {rows.map((r) => (
                <Table.Row key={r.key} id={r.key} className={r.className}>
                  {selection ? <Table.Cell className="pe-0">{selectBox(t("common.select"), "secondary")}</Table.Cell> : null}
                  {columns.map((c) => (
                    <Table.Cell key={c.key} className={c.className}>
                      {selection ? (
                        <span className="contents" onPointerDown={isolate} onClick={isolate} onKeyDown={isolateKeys}>
                          {r.cells[c.key] ?? null}
                        </span>
                      ) : (r.cells[c.key] ?? null)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      {footer}
    </>
  );

  const cards = (
    <RecordCardList footer={footer}
      selectAll={selection ? { total: selectable.length, selected: selectable.filter((k) => selection.selected.has(k)).length, onChange: (all) => setVisible(all ? selectable : []) } : undefined}>
      {rows.map((r) => (
        <RecordCard
          key={r.key}
          tone={r.tone}
          className={r.cardClassName}
          selected={selection ? selection.selected.has(r.key as K) : undefined}
          selectDisabled={disabled.has(r.key as K)}
          onSelectedChange={selection ? (on) => {
            const n = new Set(selection.selected);
            if (on) n.add(r.key as K); else n.delete(r.key as K);
            selection.onChange(n);
          } : undefined}
          selectLabel={selection?.labelOf?.(r.key as K)}
          title={r.cells[titleCol.key]}
          subtitle={subtitleCol ? r.cells[subtitleCol.key] : undefined}
          trailing={r.cardTrailing !== undefined ? r.cardTrailing : trailingCols.length ? trailingCols.map((c) => <span key={c.key}>{r.cells[c.key]}</span>) : undefined}
          footer={r.cardFooter}
        >
          {bodyCols.length > 0 && (
            <RecordFields>
              {bodyCols.map((c) => (
                <RecordField key={c.key} label={c.cardLabel ?? c.label} span={c.cardSpan}>
                  {r.cells[c.key] ?? "—"}
                </RecordField>
              ))}
            </RecordFields>
          )}
        </RecordCard>
      ))}
    </RecordCardList>
  );

  return <ResponsiveTable minWidth={minWidth} table={framed ? <Surface className="rounded-2xl p-2">{table}</Surface> : table} cards={cards} />;
}
