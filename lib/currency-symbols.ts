/**
 * Currencies whose symbol is rendered from an SVG glyph (in /public/currency-symbols)
 * instead of the Intl-provided text symbol — e.g. the new Omani rial symbol.
 *
 * To add a new currency symbol:
 *  1. Drop the SVG into public/currency-symbols/<code>.svg (any fill color; it is
 *     recolored via CSS mask to match the surrounding text).
 *  2. Add an entry below with the SVG's viewBox width/height ratio.
 */
export interface CurrencySymbolDef {
  src: string;
  /** viewBox width ÷ height — sizes the glyph relative to the font size. */
  ratio: number;
}

export const CURRENCY_SYMBOLS: Record<string, CurrencySymbolDef> = {
  OMR: { src: "/currency-symbols/omr.svg", ratio: 741.36 / 415.06 },
  SAR: { src: "/currency-symbols/sar.svg", ratio: 1124.14 / 1256.39 },
};

export function currencySymbolDef(code: string): CurrencySymbolDef | null {
  return CURRENCY_SYMBOLS[(code || "").toUpperCase()] || null;
}
