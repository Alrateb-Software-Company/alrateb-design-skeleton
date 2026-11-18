"use client";

import { createContext, useContext } from "react";
import { Label } from "@heroui/react";

export const FilterSheetContext = createContext(false);

/** True inside FilterBar's mobile sheet. */
export function useInFilterSheet() {
  return useContext(FilterSheetContext);
}

/**
 * A field's visible label. Dense toolbars rely on aria-label/placeholder only;
 * inside the filter sheet the aria-label is shown as the label so stacked
 * filters stay identifiable once a value is picked.
 */
export function FieldLabel({ label, ariaLabel }: { label?: string; ariaLabel?: string }) {
  const sheet = useContext(FilterSheetContext);
  const shown = label || (sheet ? ariaLabel : undefined);
  return shown ? <Label>{shown}</Label> : null;
}
