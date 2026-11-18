"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drop-in useState replacement that mirrors its value into a URL query
 * parameter (e.g. ?type=hotel), so page filters survive refreshes and can be
 * shared/bookmarked. The param is named after the last segment of `key`
 * ("filters.plans.sort" → ?sort=…) and is removed from the URL while the
 * value equals the default. Values must be JSON-serializable.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const param = key.split(".").pop() || key;
  const [value, setValue] = useState<T>(initial);
  const restored = useRef(false);
  const initialRef = useRef(initial);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore from the URL after mount (avoids hydration mismatches) and again
  // on back/forward navigation.
  useEffect(() => {
    const read = () => {
      const raw = new URLSearchParams(window.location.search).get(param);
      setValue(raw != null ? deserialize(raw, initialRef.current) : initialRef.current);
    };
    read();
    restored.current = true;
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [param]);

  useEffect(() => {
    if (!restored.current) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    // Debounced so rapid changes (e.g. typing in a search box) don't hit
    // browser replaceState rate limits.
    writeTimer.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const serialized = serialize(value);
      if (serialized === serialize(initialRef.current)) params.delete(param);
      else params.set(param, serialized);
      const query = params.toString();
      const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(window.history.state, "", url);
      }
    }, 150);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [param, value]);

  return [value, setValue] as const;
}

function serialize<T>(value: T): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function deserialize<T>(raw: string, initial: T): T {
  // The default's type decides how to read the param: plain strings are kept
  // as-is, everything else round-trips through JSON.
  if (typeof initial === "string") return raw as unknown as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}
