"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Label,
  parseColor,
} from "@heroui/react";

type Color = ReturnType<typeof parseColor>;

const DEFAULT_SWATCHES = [
  "#0ea5e9",
  "#38bdf8",
  "#8b5cf6",
  "#a78bfa",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#1e293b",
];

function safeParse(hex: string, fallback: string): Color {
  try {
    return parseColor(hex);
  } catch {
    return parseColor(fallback);
  }
}

/**
 * Extracts the dominant colors of an image (e.g. an uploaded logo) for use as
 * picker swatches. Downscales to a small canvas, buckets pixels at 4 bits per
 * channel, then picks the most frequent buckets that are visually distinct.
 * Transparent and near-white pixels are ignored (logo backgrounds).
 */
export async function extractImageColors(src: string, count = 8): Promise<string[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("image load failed"));
    el.src = src;
  });
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (Math.min(r, g, b) > 242) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const it = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    it.r += r;
    it.g += g;
    it.b += b;
    it.n++;
    buckets.set(key, it);
  }

  const sorted = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .map((v) => ({ r: Math.round(v.r / v.n), g: Math.round(v.g / v.n), b: Math.round(v.b / v.n) }));

  const picked: { r: number; g: number; b: number }[] = [];
  for (const c of sorted) {
    if (picked.length >= count) break;
    // Drop near-duplicates so the swatch row stays varied.
    const distinct = picked.every(
      (p) => (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2 > 40 ** 2
    );
    if (distinct) picked.push(c);
  }
  return picked.map(
    (c) => `#${[c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`
  );
}

/**
 * Hex input + swatch trigger opening a full picker popover (area, hue slider,
 * preset swatches). Drag updates stay local and are committed to the parent on
 * a short debounce so large forms don't re-render on every pointer move.
 */
export function AppColorField({
  label,
  value,
  fallback,
  isDisabled,
  onChange,
  swatches = DEFAULT_SWATCHES,
  variant = "secondary",
}: {
  label: string;
  /** Hex string ("#rrggbb") or "" when unset. */
  value: string;
  /** Hex shown/used while the value is unset. */
  fallback: string;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  swatches?: string[];
  variant?: "primary" | "secondary";
}) {
  const [draft, setDraft] = useState<Color | null>(null);
  const lastCommitted = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Drop the local draft only when the value changes from outside (e.g. form load).
  useEffect(() => {
    if (value !== lastCommitted.current) setDraft(null);
  }, [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const committed = useMemo(() => safeParse(value || fallback, fallback), [value, fallback]);
  const current = draft ?? committed;

  function handlePick(color: Color) {
    setDraft(color);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const hex = color.toString("hex");
      lastCommitted.current = hex;
      onChangeRef.current(hex);
    }, 120);
  }

  function commitText(color: Color | null) {
    clearTimeout(timer.current);
    const hex = color ? color.toString("hex") : "";
    setDraft(color);
    lastCommitted.current = hex;
    onChangeRef.current(hex);
  }

  return (
    <ColorField
      fullWidth
      isDisabled={isDisabled}
      value={value || null}
      onChange={commitText}
    >
      <Label>{label}</Label>
      <ColorField.Group variant={variant}>
        <ColorField.Prefix>
          <ColorPicker.Root value={current} onChange={handlePick}>
            <ColorPicker.Trigger aria-label={label} isDisabled={isDisabled} className="rounded-md">
              <ColorSwatch className="size-6 rounded-md border border-app-border" />
            </ColorPicker.Trigger>
            <ColorPicker.Popover>
              <div className="flex w-56 flex-col gap-3">
                <ColorArea
                  aria-label={label}
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                  className="h-36 w-full"
                >
                  <ColorArea.Thumb />
                </ColorArea>
                <ColorSlider aria-label={label} channel="hue" colorSpace="hsb">
                  <ColorSlider.Track>
                    <ColorSlider.Thumb />
                  </ColorSlider.Track>
                </ColorSlider>
                <ColorSwatchPicker aria-label={label} layout="grid">
                  {swatches.map((hex) => (
                    <ColorSwatchPicker.Item key={hex} color={hex}>
                      <ColorSwatchPicker.Swatch />
                      <ColorSwatchPicker.Indicator />
                    </ColorSwatchPicker.Item>
                  ))}
                </ColorSwatchPicker>
              </div>
            </ColorPicker.Popover>
          </ColorPicker.Root>
        </ColorField.Prefix>
        <ColorField.Input placeholder={fallback} dir="ltr" className="rtl:text-right" />
      </ColorField.Group>
    </ColorField>
  );
}

/**
 * Compact inline swatch selector (no popover) for choosing among preset colors.
 */
export function InlineSwatchPicker({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value: string;
  colors: string[];
  onChange: (hex: string) => void;
}) {
  return (
    <ColorSwatchPicker
      aria-label={label}
      layout="grid"
      size="sm"
      value={value}
      onChange={(color) => onChange(color.toString("hex"))}
    >
      {colors.map((hex) => (
        <ColorSwatchPicker.Item key={hex} color={hex}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}
