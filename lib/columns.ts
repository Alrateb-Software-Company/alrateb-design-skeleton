/** Orders `columns` by `order` (unknown keys keep their original order at the end) and drops `hidden` ones. */
export function resolveColumns<T extends { key: string }>(columns: T[], order: string[], hidden: string[]): T[] {
  const byKey = new Map(columns.map((c) => [c.key, c]));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const k of order) {
    const c = byKey.get(k);
    if (c && !seen.has(k)) { out.push(c); seen.add(k); }
  }
  for (const c of columns) if (!seen.has(c.key)) out.push(c);
  const hide = new Set(hidden);
  return out.filter((c) => !hide.has(c.key));
}
