"use client";

import type { ReactNode } from "react";

/**
 * A titled card for long forms: an icon tile, a clear section title, an
 * optional hint and actions on the right. Stack several with `gap-4`.
 */
export function FormSection({ icon, title, hint, actions, children, className = "" }: {
  icon?: ReactNode;
  title: string;
  hint?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 text-foreground sm:p-5 dark:border-neutral-800 dark:bg-neutral-900/40 ${className}`}>
      <header className="flex flex-wrap items-center gap-3">
        {icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent [&>svg]:size-[18px]">{icon}</span>}
        <div className="min-w-0 flex-1 basis-48">
          <h3 className="text-base font-semibold leading-tight">{title}</h3>
          {hint && <p className="mt-0.5 text-sm text-neutral-500">{hint}</p>}
        </div>
        {actions && <div className="ms-auto flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

/** Small label separating groups inside a section (e.g. "Name in English" / "Name in Arabic"). */
export function FormGroupLabel({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</span>
      <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      {actions}
    </div>
  );
}

/** Two-column field grid used inside form sections. */
export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid gap-4 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{children}</div>;
}

/** Sticky modal footer: optional notice (e.g. duplicate matches), error line, then actions. */
export function FormFooter({ error, notice, children }: { error?: string | null; notice?: ReactNode; children: ReactNode }) {
  return (
    <>
      {notice && <div className="max-h-40 overflow-y-auto">{notice}</div>}
      {error && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">{children}</div>
    </>
  );
}

/** Opening card of a person form: avatar + photo / ID-scan actions with a short tip. */
export function FormIntro({ media, hint, children }: { media: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-neutral-100/70 p-4 dark:bg-neutral-800/40">
      {media}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">{children}</div>
        {hint && <p className="text-sm text-neutral-500">{hint}</p>}
      </div>
    </div>
  );
}
