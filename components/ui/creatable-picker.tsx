"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, Chip, EmptyState, Label, ListBox, SearchField, useFilter } from "@heroui/react";
import type { Key } from "@heroui/react";
import { Plus, X } from "lucide-react";

export interface CreatableOption {
  value: string;
  label: string;
}

const ADD_PREFIX = "__add__:";
const HINT_ID = "__hint__";
const MAX_CUSTOM_LENGTH = 120;

/**
 * Shared bits for a HeroUI Autocomplete whose list is extended with an
 * "Add “typed text”" row whenever the typed text does not match an option.
 * Custom values are stored verbatim (the label is the value itself).
 */
function useCreatable(options: CreatableOption[], selected: string[]) {
  const { t } = useTranslation();
  const { contains } = useFilter({ sensitivity: "base" });
  const [inputValue, setInputValue] = useState("");

  const labelOf = useMemo(() => {
    const m = new Map(options.map((o) => [o.value, o.label]));
    return (v: string) => m.get(v) ?? v;
  }, [options]);

  // Options + any custom values already selected (so they render with a label).
  const items = useMemo(() => {
    const known = new Set(options.map((o) => o.value));
    const custom = selected.filter((v) => !known.has(v)).map((v) => ({ value: v, label: v }));
    return [...options, ...custom];
  }, [options, selected]);

  const typed = inputValue.trim().slice(0, MAX_CUSTOM_LENGTH);
  const exact = typed
    ? items.some((o) => o.label.localeCompare(typed, undefined, { sensitivity: "base" }) === 0 || o.value === typed)
    : true;
  const addItem = typed && !exact ? { id: ADD_PREFIX + typed, text: typed } : null;

  /** Turn `__add__:x` keys into `x`; the disabled hint row resolves to nothing. */
  const resolve = (key: Key) => {
    const s = String(key);
    if (s === HINT_ID) return "";
    return s.startsWith(ADD_PREFIX) ? s.slice(ADD_PREFIX.length) : s;
  };

  return { t, contains, inputValue, setInputValue, labelOf, items, addItem, resolve };
}

function FilterBody({
  items,
  addItem,
  inputValue,
  setInputValue,
  contains,
  searchPlaceholder,
  addLabel,
  emptyLabel,
  hintLabel,
  onAdd,
}: {
  items: CreatableOption[];
  addItem: { id: string; text: string } | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  contains: (text: string, input: string) => boolean;
  searchPlaceholder: string;
  addLabel: string;
  emptyLabel: string;
  hintLabel: string;
  /** Enter in the search box adds the typed text without having to click the "Add" row. */
  onAdd: (text: string) => void;
}) {
  return (
    <Autocomplete.Filter filter={contains} inputValue={inputValue} onInputChange={setInputValue}>
      <SearchField autoFocus name="search" variant="secondary" className="sticky top-0 z-10">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            placeholder={searchPlaceholder}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !addItem) return;
              e.preventDefault();
              e.stopPropagation();
              onAdd(addItem.text);
              setInputValue("");
            }}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <ListBox className="max-h-72 overflow-y-auto" renderEmptyState={() => <EmptyState>{emptyLabel}</EmptyState>}>
        {addItem ? (
          <ListBox.Item key={addItem.id} id={addItem.id} textValue={addItem.text} className="text-accent">
            <Plus className="size-4" />
            {addLabel}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ) : null}
        {/* Autocomplete refuses to open on an empty collection, so keep a disabled hint row when there is nothing to list. */}
        {!addItem && items.length === 0 ? (
          <ListBox.Item key={HINT_ID} id={HINT_ID} textValue={inputValue || hintLabel} isDisabled className="text-muted">
            {hintLabel}
          </ListBox.Item>
        ) : null}
        {items.map((o) => (
          <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
            {o.label}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Autocomplete.Filter>
  );
}

/** Multi-select autocomplete with free-text additions, rendered as removable chips. */
export function CreatableMultiPicker({
  label,
  value,
  onChange,
  options,
  placeholder,
  isRequired,
  isDisabled,
  className,
  maxItems = 40,
  variant = "secondary",
}: {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: CreatableOption[];
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  maxItems?: number;
  variant?: "primary" | "secondary";
}) {
  const c = useCreatable(options, value);

  const handleChange = (keys: Key[]) => {
    const next: string[] = [];
    for (const k of keys) {
      const v = c.resolve(k);
      if (v && !next.includes(v)) next.push(v);
    }
    onChange(next.slice(0, maxItems));
    if (keys.some((k) => String(k).startsWith(ADD_PREFIX))) c.setInputValue("");
  };

  return (
    <div className={className}>
      <Autocomplete
        selectionMode="multiple"
        fullWidth
        variant={variant}
        isRequired={isRequired}
        isDisabled={isDisabled}
        placeholder={placeholder || c.t("common.select")}
        aria-label={label}
        value={value}
        onChange={handleChange}
      >
        {label ? <Label>{label}</Label> : null}
        <Autocomplete.Trigger>
          <Autocomplete.Value>{() => (value.length ? c.t("common.selectedCount", { count: value.length }) : placeholder || c.t("common.select"))}</Autocomplete.Value>
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <FilterBody
            items={c.items}
            addItem={c.addItem}
            inputValue={c.inputValue}
            setInputValue={c.setInputValue}
            contains={c.contains}
            searchPlaceholder={c.t("common.searchOrType")}
            addLabel={c.t("common.addCustom", { value: c.addItem?.text ?? "" })}
            emptyLabel={c.t("common.noResults")}
            hintLabel={c.t("common.typeToAdd")}
            onAdd={(text) => { if (!value.includes(text)) onChange([...value, text].slice(0, maxItems)); }}
          />
        </Autocomplete.Popover>
      </Autocomplete>
      {value.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Chip key={v} size="sm" variant="soft">
              <Chip.Label>{c.labelOf(v)}</Chip.Label>
              {!isDisabled ? (
                <button
                  type="button"
                  aria-label={c.t("common.remove")}
                  className="ms-1 rounded-full p-0.5 hover:bg-default/40"
                  onClick={() => onChange(value.filter((x) => x !== v))}
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Single-value autocomplete with a free-text "Add" row. */
export function CreatableSinglePicker({
  label,
  value,
  onChange,
  options,
  placeholder,
  isRequired,
  isDisabled,
  className,
  ariaLabel,
  variant = "secondary",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: CreatableOption[];
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary";
}) {
  const c = useCreatable(options, value ? [value] : []);

  return (
    <Autocomplete
      selectionMode="single"
      fullWidth
      variant={variant}
      className={className}
      isRequired={isRequired}
      isDisabled={isDisabled}
      placeholder={placeholder || "—"}
      aria-label={ariaLabel || label}
      value={value || null}
      onChange={(key: Key | Key[] | null) => {
        if (key == null) return onChange("");
        const k = Array.isArray(key) ? key[0] : key;
        onChange(k == null ? "" : c.resolve(k));
        c.setInputValue("");
      }}
    >
      {label ? <Label>{label}</Label> : null}
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <FilterBody
          items={c.items}
          addItem={c.addItem}
          inputValue={c.inputValue}
          setInputValue={c.setInputValue}
          contains={c.contains}
          searchPlaceholder={c.t("common.searchOrType")}
          addLabel={c.t("common.addCustom", { value: c.addItem?.text ?? "" })}
          emptyLabel={c.t("common.noResults")}
          hintLabel={c.t("common.typeToAdd")}
          onAdd={(text) => onChange(text)}
        />
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
