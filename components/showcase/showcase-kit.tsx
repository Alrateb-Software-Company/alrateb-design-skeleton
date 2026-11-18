"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, toast } from "@heroui/react";
import { Check, Code2, Copy } from "lucide-react";

/** One anchored block on the showcase page (the id feeds the table of contents). */
export function ShowcaseSection({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-neutral-500">{hint}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

/** A live demo with an optional usage snippet that can be revealed and copied. */
export function Example({ title, code, children, className = "" }: { title?: string; code?: string; children: ReactNode; className?: string }) {
  const { t } = useTranslation();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t("showcase.copied"));
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="overflow-hidden rounded-3xl bg-app-surface shadow-sm">
      {(title || code) && (
        <div className="flex items-center gap-2 border-b border-app-border px-4 py-2.5">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {code && (
            <Button size="sm" variant="ghost" className="ms-auto" onPress={() => setShowCode((s) => !s)}>
              <Code2 className="size-4" />
              {showCode ? t("showcase.hideCode") : t("showcase.showCode")}
            </Button>
          )}
        </div>
      )}
      <div className={`p-4 sm:p-5 ${className}`}>{children}</div>
      {code && showCode && (
        <div className="relative border-t border-app-border bg-neutral-950 text-neutral-100">
          <Button size="sm" isIconOnly variant="ghost" aria-label={t("showcase.copy")} className="absolute end-2 top-2 text-neutral-300" onPress={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
          <pre dir="ltr" className="overflow-x-auto p-4 pe-12 text-start text-[12.5px] leading-relaxed">
            <code>{code.trim()}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

/** Small caption row for grouping variants inside an Example. */
export function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</span>}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
