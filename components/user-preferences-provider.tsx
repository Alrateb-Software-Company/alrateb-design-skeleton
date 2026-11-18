"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Per-user UI preferences (sidebar state, table columns, saved filters, theme…).
 *
 * The skeleton keeps them in localStorage. In a real app, make the database the
 * source of truth (GET/PATCH /api/v1/profile/preferences) and use localStorage
 * only as a per-device cache — the hook API below stays the same.
 */

type Prefs = Record<string, unknown>;

interface PreferencesContextValue {
  prefs: Prefs;
  /** False during SSR / the first client render, so markup matches the server. */
  loaded: boolean;
  set: (key: string, updater: (prev: unknown) => unknown) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const PREFIX = "pref.";

function readAll(): Prefs {
  const out: Prefs = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      try {
        out[k.slice(PREFIX.length)] = JSON.parse(window.localStorage.getItem(k) ?? "null");
      } catch {
        // Corrupt entry — ignore.
      }
    }
  } catch {
    // Storage unavailable (private mode).
  }
  return out;
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [loaded, setLoaded] = useState(false);
  const prefsRef = useRef(prefs);

  useEffect(() => {
    const all = readAll();
    prefsRef.current = all;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setPrefs(all);
    setLoaded(true);
  }, []);

  const set = useCallback((key: string, updater: (prev: unknown) => unknown) => {
    const next = updater(prefsRef.current[key]);
    const nextPrefs = { ...prefsRef.current };
    if (next === undefined) delete nextPrefs[key];
    else nextPrefs[key] = next;
    prefsRef.current = nextPrefs;
    setPrefs(nextPrefs);
    try {
      if (next === undefined) window.localStorage.removeItem(PREFIX + key);
      else window.localStorage.setItem(PREFIX + key, JSON.stringify(next));
    } catch {
      // Best effort.
    }
  }, []);

  const value = useMemo(() => ({ prefs, loaded, set }), [prefs, loaded, set]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/**
 * useState-like accessor for one preference. Returns `initial` until the
 * stored value is known; setting a value equal to `initial` deletes the key.
 * Values must be JSON-serializable.
 */
export function useUserPreference<T>(key: string, initial: T) {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("useUserPreference must be used inside <UserPreferencesProvider>");
  const { prefs, loaded, set } = ctx;
  const initialRef = useRef(initial);
  useEffect(() => {
    initialRef.current = initial;
  });

  const value = (loaded && key in prefs ? prefs[key] : initial) as T;

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      set(key, (prevRaw) => {
        const prev = (prevRaw === undefined ? initialRef.current : prevRaw) as T;
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        return JSON.stringify(resolved) === JSON.stringify(initialRef.current) ? undefined : resolved;
      });
    },
    [key, set]
  );

  return [value, update] as const;
}
