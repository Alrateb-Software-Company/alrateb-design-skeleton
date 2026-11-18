"use client";

import { useTranslation } from "react-i18next";
import { Hourglass } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui/page";

/** Placeholder for nav items marked `soon` in config/nav.ts. */
export function ComingSoon({ titleKey, icon }: { titleKey: string; icon: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t(titleKey)} icon={icon} />
      <EmptyState icon={<Hourglass className="size-6" />} title={t("common.comingSoon")} hint={t("common.comingSoonHint")} action={{ label: t("nav.dashboard"), href: "/dashboard" }} />
    </div>
  );
}
