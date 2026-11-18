"use client";

import { useTranslation } from "react-i18next";
import { AppSelect } from "@/components/ui/app-select";

/** Compact sort dropdown used above list views (HeroUI Select). */
export function SortSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; labelKey: string }[];
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <AppSelect
      className="w-44 shrink-0"
      fullWidth={false}
      ariaLabel={t("common.sortBy")}
      value={value}
      onChange={(v) => v && onChange(v)}
      options={options.map((opt) => ({ value: opt.value, label: t(opt.labelKey) }))}
    />
  );
}
