"use client";

import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { currencySymbolDef } from "@/lib/currency-symbols";
import { formatMoney } from "@/lib/format";

/**
 * Renders a currency code as its SVG glyph when one is registered
 * (lib/currency-symbols.ts), otherwise falls back to the plain code text.
 * The glyph inherits the surrounding text color via CSS mask.
 */
export function CurrencySymbol({ currency, className }: { currency: string; className?: string }) {
  const def = currencySymbolDef(currency);
  if (!def) return <>{currency}</>;
  return (
    <span
      role="img"
      aria-label={currency}
      className={`inline-block align-[-0.02em] ${className || ""}`}
      style={{
        height: "0.72em",
        aspectRatio: String(def.ratio),
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${def.src})`,
        maskImage: `url(${def.src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/**
 * Money display: identical output to formatMoney(), but swaps the currency
 * symbol for its SVG glyph when the currency has one registered.
 * Use in JSX text positions; keep formatMoney() for string contexts
 * (t() params, messages, exports).
 */
export function Money({
  amount,
  currency,
  className,
  symbolClassName,
  maxFractionDigits = 2,
  minFractionDigits = 2,
  locale,
}: {
  amount: number;
  currency: string;
  className?: string;
  /** Give the glyph a solid color when the digits use bg-clip-text (currentColor would be transparent). */
  symbolClassName?: string;
  /** Raise for sub-cent unit prices (e.g. OMR 0.003/email). */
  maxFractionDigits?: number;
  /** Lower to drop trailing zeros (e.g. marketing prices: OMR 39). */
  minFractionDigits?: number;
  /** Overrides the app i18n language (pages with their own locale state). */
  locale?: string;
}) {
  const { i18n } = useTranslation();
  const lang = locale || i18n.language;
  const def = currencySymbolDef(currency);
  const maxDigits = Math.max(minFractionDigits, maxFractionDigits);
  if (!def) {
    // Plain-text currencies: honour the digit props too (formatMoney is fixed at 2).
    let text: string;
    if (minFractionDigits === 2 && maxDigits === 2) text = formatMoney(amount, currency, lang);
    else {
      try {
        text = new Intl.NumberFormat(lang === "ar" ? "ar" : "en", { style: "currency", currency, minimumFractionDigits: minFractionDigits, maximumFractionDigits: maxDigits }).format(amount);
      } catch {
        text = formatMoney(amount, currency, lang);
      }
    }
    return <span className={className}>{text}</span>;
  }

  let parts: Intl.NumberFormatPart[];
  try {
    parts = new Intl.NumberFormat(lang === "ar" ? "ar" : "en", {
      style: "currency",
      currency,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxDigits,
    }).formatToParts(amount);
  } catch {
    return (
      <span className={className}>
        {amount.toFixed(2)} <CurrencySymbol currency={currency} className={symbolClassName} />
      </span>
    );
  }

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.type === "currency" ? (
          <CurrencySymbol key={idx} currency={currency} className={symbolClassName} />
        ) : (
          <Fragment key={idx}>{part.value}</Fragment>
        )
      )}
    </span>
  );
}
