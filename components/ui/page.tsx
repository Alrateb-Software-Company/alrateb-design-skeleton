"use client";

import { Button, EmptyState as HeroEmptyState } from "@heroui/react";
import { LinkButton } from "@/components/ui/link-button";

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
  extra,
}: {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onPress: () => void;
  };
  /** Secondary controls rendered before the primary action. */
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <div className="mt-0.5 text-sm text-neutral-500">{subtitle}</div>}
        </div>
      </div>
      {(extra || action) && (
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {extra}
          {action && (
            <Button onPress={action.onPress}>
              {action.icon}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  action?: { label: string; onPress: () => void } | { label: string; href: string };
}) {
  return (
    <HeroEmptyState className="flex flex-col items-center justify-center rounded-3xl bg-app-surface px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-neutral-500/10 text-neutral-400">
        {icon}
      </div>
      <p className="text-base font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-neutral-500">{hint}</p>}
      {action &&
        ("href" in action ? (
          <LinkButton href={action.href} className="mt-5">
            {action.label}
          </LinkButton>
        ) : (
          <Button className="mt-5" onPress={action.onPress}>
            {action.label}
          </Button>
        ))}
    </HeroEmptyState>
  );
}
