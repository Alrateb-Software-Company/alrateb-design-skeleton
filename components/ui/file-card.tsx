"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, FileText, FileSpreadsheet, File as FileIcon, Play } from "lucide-react";
import { MediaViewer, mediaKind } from "@/components/ui/media-viewer";

// Square attachment card: inline preview for images, a typed icon otherwise.
// Images/PDFs open in the full-screen MediaViewer; other types open in a tab.

const VIDEO_EXTS = new Set(["mp4", "webm"]);

function extOf(path: string): string {
  const clean = path.split("?")[0];
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "" : clean.slice(dot + 1).toLowerCase();
}

function iconFor(ext: string): { Icon: React.ComponentType<{ className?: string }>; tone: string } {
  if (ext === "pdf") return { Icon: FileText, tone: "text-red-500 bg-red-500/10" };
  if (ext === "doc" || ext === "docx") return { Icon: FileText, tone: "text-sky-500 bg-sky-500/10" };
  if (ext === "xls" || ext === "xlsx" || ext === "csv")
    return { Icon: FileSpreadsheet, tone: "text-emerald-500 bg-emerald-500/10" };
  if (VIDEO_EXTS.has(ext)) return { Icon: Play, tone: "text-violet-500 bg-violet-500/10" };
  return { Icon: FileIcon, tone: "text-neutral-500 bg-neutral-500/10" };
}

export function FileCard({
  path,
  name,
  size = "md",
  onRemove,
  secondaryAction,
}: {
  path: string;
  name: string;
  /** md = 7rem square, sm = 5rem square. */
  size?: "sm" | "md";
  onRemove?: () => void;
  /** Extra corner button on the start side (e.g. "save to client documents"). */
  secondaryAction?: { label: string; icon: React.ReactNode; onAction: () => void };
}) {
  const { t } = useTranslation();
  const [viewerOpen, setViewerOpen] = useState(false);
  const ext = extOf(path);
  const kind = mediaKind(path);
  const { Icon, tone } = iconFor(ext);
  const width = size === "sm" ? "w-20" : "w-28";

  const tileContent =
    kind === "image" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={path} alt={name} loading="lazy" className="size-full object-cover" />
    ) : (
      <span className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${tone}`}>
        <Icon className={size === "sm" ? "size-5" : "size-7"} />
        {ext && <span className="text-[10px] font-bold uppercase tracking-wide">{ext}</span>}
      </span>
    );

  const tileClass =
    "flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-app-border bg-black/[0.02] dark:bg-white/[0.03]";

  return (
    <div className={`group relative ${width} shrink-0`}>
      {kind ? (
        <button
          type="button"
          title={name}
          onClick={() => setViewerOpen(true)}
          className={`${tileClass} cursor-zoom-in`}
        >
          {tileContent}
        </button>
      ) : (
        <a href={path} target="_blank" rel="noreferrer" title={name} className={tileClass}>
          {tileContent}
        </a>
      )}
      <p className="mt-1 truncate text-center text-[11px] text-neutral-500" title={name}>
        {name}
      </p>
      {onRemove && (
        <button
          type="button"
          aria-label={t("common.remove")}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -end-1.5 -top-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-app-border bg-app-surface text-neutral-400 shadow-sm transition-colors hover:border-red-300 hover:text-red-500 md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      )}
      {secondaryAction && (
        <button
          type="button"
          aria-label={secondaryAction.label}
          title={secondaryAction.label}
          onClick={(e) => {
            e.stopPropagation();
            secondaryAction.onAction();
          }}
          className="absolute -start-1.5 -top-1.5 z-10 flex size-6 items-center justify-center rounded-full border border-app-border bg-app-surface text-neutral-400 shadow-sm transition-colors hover:border-sky-300 hover:text-sky-500 md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
        >
          {secondaryAction.icon}
        </button>
      )}
      {viewerOpen && (
        <MediaViewer
          items={[{ url: path, title: name }]}
          index={0}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
