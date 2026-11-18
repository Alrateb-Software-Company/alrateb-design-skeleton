/**
 * One English initial (the first name's first letter) from the first name that is written in Latin letters.
 * Non-Latin names are never transliterated: returns "" when no English name is given, and callers show the
 * school logo instead.
 */
export function englishInitials(...names: Array<string | null | undefined>): string {
  for (const n of names) {
    const letters = (n || "")
      .trim()
      .split(/\s+/)
      .map((w) => [...w].find((c) => /\p{L}|\d/u.test(c)) ?? "")
      .filter((c) => /[A-Za-z0-9\u00C0-\u024F]/.test(c))
      .map((c) => c.normalize("NFD")[0].toUpperCase());
    if (letters.length) return letters[0];
  }
  return "";
}
