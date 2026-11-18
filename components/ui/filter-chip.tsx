"use client";

import { ToggleButton } from "@heroui/react";

/** HeroUI toggle pill used for list filters (status/type/category chips). */
export function FilterChip({
  label,
  isSelected,
  onChange,
  isDisabled,
}: {
  label: string;
  isSelected: boolean;
  onChange: (selected: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <ToggleButton
      size="sm"
      variant="ghost"
      isSelected={isSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      className={`h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs font-medium transition-colors ${
        isSelected
          ? "bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/40 dark:text-sky-400"
          : "bg-app-surface text-neutral-500 shadow-sm hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      {label}
    </ToggleButton>
  );
}
