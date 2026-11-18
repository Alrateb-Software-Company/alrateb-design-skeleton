"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, EmptyState, Label, ListBox, SearchField, Spinner } from "@heroui/react";
import type { Key } from "@heroui/react";

export interface RemoteOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  /** The English name behind a localized label (for avatar initials). */
  en?: string;
}

/**
 * HeroUI Autocomplete whose options come from a debounced server search
 * (students, guardians… — lists that can be far larger than one page). The
 * currently selected option is always kept in the list so its label shows
 * even when it is not part of the latest search results.
 */
export function RemotePicker({
  label,
  value,
  selected,
  onChange,
  search,
  placeholder,
  isRequired,
  isDisabled,
  className,
  variant = "secondary",
  minChars = 0,
  exclude,
}: {
  label?: string;
  value: string;
  /** The selected option (for the trigger label) when it may not be in the results. */
  selected?: RemoteOption | null;
  onChange: (value: string, option: RemoteOption | null) => void;
  search: (q: string) => Promise<RemoteOption[]>;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
  minChars?: number;
  /** Values to hide from the results (applied on render, so it stays current without a new search). */
  exclude?: string[];
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [options, setOptions] = useState<RemoteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const searchRef = useRef(search);
  useEffect(() => { searchRef.current = search; });

  const tooShort = q.length < minChars;
  useEffect(() => {
    if (tooShort) return;
    const id = ++seq.current;
    const h = setTimeout(() => {
      setLoading(true);
      searchRef.current(q).then((res) => { if (seq.current === id) setOptions(res); }).catch(() => { if (seq.current === id) setOptions([]); }).finally(() => { if (seq.current === id) setLoading(false); });
    }, q ? 250 : 0);
    return () => clearTimeout(h);
  }, [q, tooShort]);

  const visible = tooShort ? [] : exclude?.length ? options.filter((o) => !exclude.includes(o.value)) : options;
  const items = selected && !visible.some((o) => o.value === selected.value) ? [selected, ...visible] : visible;

  return (
    <Autocomplete
      className={className}
      fullWidth
      variant={variant}
      isRequired={isRequired}
      isDisabled={isDisabled}
      selectionMode="single"
      // The list starts empty until the user types (minChars) — without this the popover never opens.
      allowsEmptyCollection
      placeholder={placeholder || "—"}
      aria-label={label}
      value={value || null}
      onChange={(key: Key | Key[] | null) => { const v = key == null ? "" : String(key); onChange(v, items.find((o) => o.value === v) ?? null); }}
    >
      {label ? <Label>{label}</Label> : null}
      <Autocomplete.Trigger>
        <Autocomplete.Value className="flex flex-row items-center gap-2" />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        {/* Server-side filtering: every item passes the local filter. */}
        <Autocomplete.Filter filter={() => true}>
          <SearchField autoFocus name="search" aria-label={t("common.search")} variant="secondary" className="sticky top-0 z-10" value={q} onChange={setQ}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t("common.search")} />
              {loading ? <Spinner size="sm" /> : <SearchField.ClearButton />}
            </SearchField.Group>
          </SearchField>
          <ListBox className="max-h-72 overflow-y-auto" renderEmptyState={() => <EmptyState>{loading ? "…" : q.length < minChars ? t("common.typeToSearch") : t("common.noResults")}</EmptyState>}>
            {items.map((o) => (
              <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                {o.icon}
                <span className="flex min-w-0 flex-col"><span className="truncate">{o.label}</span>{o.description && <span className="truncate text-xs text-neutral-500">{o.description}</span>}</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
