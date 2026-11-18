"use client";

import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";

/** Inline alert used inside modals/sections whose feature is off for the tenant's plan. */
export function FeatureDisabledNotice({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400 ${className || ""}`}
    >
      <Lock className="size-4 shrink-0" />
      {t("common.featureDisabled")}
    </div>
  );
}
