"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUserPreference } from "@/hooks/useUserPreference";

/**
 * List-page filter state (search, selects, sort, page…):
 *  - every key is mirrored into the URL (`?status=a,b&q=x`), exactly like
 *    `usePersistedState`, so filters survive refresh and can be shared;
 *  - per-user **presets** are stored in the DB (`user_preferences`,
 *    key `filters.<pageKey>`) so they follow the user across devices. One
 *    preset can be the default and is applied on a fresh visit (no URL params).
 *
 * Values must be strings, numbers, booleans or string arrays.
 */

export type FilterValue = string | number | boolean | string[];
export type FilterValues = Record<string, FilterValue>;

export interface FilterPreset<T extends FilterValues> {
  id: string;
  name: string;
  values: Partial<T>;
}

interface PresetStore<T extends FilterValues> {
  presets: FilterPreset<T>[];
  defaultId: string | null;
}

function serialize(v: FilterValue): string {
  return Array.isArray(v) ? v.join(",") : String(v);
}

function deserialize(raw: string, template: FilterValue): FilterValue {
  if (Array.isArray(template)) return raw ? raw.split(",").filter(Boolean) : [];
  if (typeof template === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : template;
  }
  if (typeof template === "boolean") return raw === "1" || raw === "true";
  return raw;
}

function same(a: FilterValue, b: FilterValue): boolean {
  return serialize(a) === serialize(b);
}

export function useListFilters<T extends FilterValues>(pageKey: string, defaults: T) {
  const defaultsRef = useRef(defaults);
  const [values, setValues] = useState<T>(defaults);
  const [ready, setReady] = useState(false);
  const [store, setStore] = useUserPreference<PresetStore<T>>(`filters.${pageKey}`, { presets: [], defaultId: null });
  const appliedDefault = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore from the URL after mount; again on back/forward.
  useEffect(() => {
    const read = () => {
      const sp = new URLSearchParams(window.location.search);
      const next = { ...defaultsRef.current } as T;
      let any = false;
      for (const k of Object.keys(next)) {
        const raw = sp.get(k);
        if (raw == null) continue;
        any = true;
        (next as FilterValues)[k] = deserialize(raw, defaultsRef.current[k]);
      }
      setValues(next);
      // A fresh visit without any filter params gets the user's default preset.
      if (any) appliedDefault.current = true;
      setReady(true);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // Apply the default preset once, only when the URL carried nothing. Deferred
  // so it runs after the preferences provider has delivered the stored value.
  useEffect(() => {
    if (!ready || appliedDefault.current) return;
    const def = store.defaultId ? store.presets.find((p) => p.id === store.defaultId) : null;
    if (!def) return;
    appliedDefault.current = true;
    const timer = setTimeout(() => setValues((v) => ({ ...v, ...def.values, page: 1 } as T)), 0);
    return () => clearTimeout(timer);
  }, [ready, store]);

  // Mirror into the URL (debounced; keys equal to their default are removed).
  useEffect(() => {
    if (!ready) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      const sp = new URLSearchParams(window.location.search);
      for (const k of Object.keys(defaultsRef.current)) {
        if (same(values[k], defaultsRef.current[k])) sp.delete(k);
        else sp.set(k, serialize(values[k]));
      }
      const qs = sp.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, "", url);
    }, 150);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [values, ready]);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    // Changing any filter other than the page itself returns to page 1.
    setValues((v) => ({ ...v, [key]: value, ...(key !== "page" && "page" in v ? { page: 1 } : {}) }) as T);
  }, []);
  const patch = useCallback((p: Partial<T>) => setValues((v) => ({ ...v, ...p, ...("page" in v && !("page" in p) ? { page: 1 } : {}) }) as T), []);
  const reset = useCallback(() => {
    appliedDefault.current = true;
    setValues(defaultsRef.current);
  }, []);

  // Presets ---------------------------------------------------------------
  // Non-default filter values (what a preset stores); `defaults` is a module
  // constant per page so it is safe to read during render.
  const diff = useMemo((): Partial<T> => {
    const out: Partial<T> = {};
    for (const k of Object.keys(defaults) as (keyof T)[]) {
      if (k === "page") continue;
      if (!same(values[k], defaults[k])) out[k] = values[k];
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);
  const diffRef = useRef(diff);
  useEffect(() => {
    diffRef.current = diff;
  }, [diff]);
  const presetValues = useCallback((): Partial<T> => diffRef.current, []);

  const savePreset = useCallback(
    (name: string, makeDefault = false) => {
      const id = Math.random().toString(36).slice(2, 10);
      setStore((s) => ({ presets: [...s.presets, { id, name: name.trim(), values: presetValues() }], defaultId: makeDefault ? id : s.defaultId }));
      return id;
    },
    [presetValues, setStore]
  );
  const updatePreset = useCallback(
    (id: string) => setStore((s) => ({ ...s, presets: s.presets.map((p) => (p.id === id ? { ...p, values: presetValues() } : p)) })),
    [presetValues, setStore]
  );
  const applyPreset = useCallback(
    (id: string) => {
      const p = store.presets.find((x) => x.id === id);
      if (!p) return;
      appliedDefault.current = true;
      setValues({ ...defaultsRef.current, ...p.values, ...("page" in defaultsRef.current ? { page: 1 } : {}) } as T);
    },
    [store.presets]
  );
  const deletePreset = useCallback((id: string) => setStore((s) => ({ presets: s.presets.filter((p) => p.id !== id), defaultId: s.defaultId === id ? null : s.defaultId })), [setStore]);
  const setDefaultPreset = useCallback((id: string | null) => setStore((s) => ({ ...s, defaultId: id })), [setStore]);
  const renamePreset = useCallback((id: string, name: string) => setStore((s) => ({ ...s, presets: s.presets.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)) })), [setStore]);

  /** Preset whose values exactly match the current filters (for highlighting). */
  const activePresetId = useMemo(() => {
    const cur = JSON.stringify(diff);
    return store.presets.find((p) => JSON.stringify(p.values) === cur)?.id ?? null;
  }, [store.presets, diff]);

  return {
    values,
    ready,
    set,
    patch,
    reset,
    dirty: Object.keys(diff).length > 0,
    /** Filter keys that differ from the defaults (page excluded). */
    activeKeys: Object.keys(diff),
    presets: {
      list: store.presets,
      defaultId: store.defaultId,
      activeId: activePresetId,
      save: savePreset,
      update: updatePreset,
      apply: applyPreset,
      remove: deletePreset,
      setDefault: setDefaultPreset,
      rename: renamePreset,
    },
  };
}

export type ListFilters<T extends FilterValues> = ReturnType<typeof useListFilters<T>>;
