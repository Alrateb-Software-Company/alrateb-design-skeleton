"use client";

import { useCallback, useEffect, useRef, useState, type Key } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

/**
 * Tab selection mirrored into the URL (`?tab=units`) so refresh, back/forward
 * and shared links land on the same tab. Spread the result onto HeroUI `Tabs`:
 *   const tab = usePersistedTab("overview");  <Tabs {...tab.props}>
 */
export function usePersistedTab(initial: string, param = "tab") {
  const [tab, setTab] = usePersistedState<string>(param, initial);
  // The tab is restored from the URL right after mount. Animating the
  // indicator during that switch can leave react-aria's shared-element
  // `translate` override stuck on the wrong tab, so the indicator transition
  // is disabled (see globals.css) until the frame after restoration.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, []);
  // On narrow screens the tab strip scrolls; keep the selected tab visible (e.g. `?tab=settings` on a phone).
  // A callback ref also covers Tabs that mount later (pages that show a skeleton first).
  const node = useRef<HTMLDivElement | null>(null);
  const reveal = useCallback(() => requestAnimationFrame(() => {
    const root = node.current;
    const el = root?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    let strip = el?.parentElement ?? null;
    while (strip && strip !== root && strip.scrollWidth <= strip.clientWidth) strip = strip.parentElement;
    if (!el || !strip || strip === root) return;
    const a = el.getBoundingClientRect(), b = strip.getBoundingClientRect();
    if (a.left < b.left || a.right > b.right) strip.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: "smooth" });
  }), []);
  const ref = useCallback((el: HTMLDivElement | null) => {
    node.current = el;
    if (el) reveal();
  }, [reveal]);
  useEffect(() => {
    const id = reveal();
    return () => cancelAnimationFrame(id);
  }, [tab, reveal]);
  return {
    tab,
    setTab,
    props: {
      ref,
      selectedKey: tab,
      onSelectionChange: (key: Key) => setTab(String(key)),
      "data-tab-restoring": settled ? undefined : true,
    },
  };
}
