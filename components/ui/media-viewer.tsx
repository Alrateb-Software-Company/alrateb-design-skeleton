"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Reusable full-screen media viewer (alrateb lightbox pattern):
// - images: zoom (buttons + wheel), drag-to-pan when zoomed, prev/next
// - PDFs: inline <iframe> (same-origin, cookies included)
// - Escape/arrow keys, body scroll lock, download / open-in-tab actions.

export interface MediaItem {
  url: string;
  title?: string;
}

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

export function mediaKind(path: string): "image" | "pdf" | null {
  const clean = path.split("?")[0];
  const ext = clean.slice(clean.lastIndexOf(".") + 1).toLowerCase();
  if (IMAGE_EXTS.has(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return null;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

export function MediaViewer({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: MediaItem[];
  index: number;
  onIndexChange?: (next: number) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pan = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  const total = items.length;
  const current = items[Math.min(index, total - 1)];
  const kind = current ? mediaKind(current.url) : null;

  useEffect(() => {
    const handle = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(handle);
  }, []);

  // Reset zoom/pan when switching media (adjust-state-during-render pattern).
  const [prevIndex, setPrevIndex] = useState(index);
  if (prevIndex !== index) {
    setPrevIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const goPrev = useCallback(() => {
    if (total > 1) onIndexChange?.((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (total > 1) onIndexChange?.((index + 1) % total);
  }, [index, total, onIndexChange]);

  // Keyboard + body scroll lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext]);

  function zoomBy(delta: number) {
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2)));
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 });
      return next;
    });
  }

  function handleDownload() {
    if (!current) return;
    const a = document.createElement("a");
    a.href = current.url;
    a.download = current.title || current.url.split("/").pop() || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!mounted || !current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-sm" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="min-w-0 truncate text-sm font-medium text-white/90">
          {current.title || current.url.split("/").pop()}
          {total > 1 && <span className="ms-2 text-white/50">{index + 1} / {total}</span>}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {kind === "image" && (
            <>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={t("viewer.zoomOut")}
                isDisabled={zoom <= MIN_ZOOM}
                onPress={() => zoomBy(-ZOOM_STEP)}
                className="rounded-full text-white/80 hover:bg-white/10"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={t("viewer.zoomIn")}
                isDisabled={zoom >= MAX_ZOOM}
                onPress={() => zoomBy(ZOOM_STEP)}
                className="rounded-full text-white/80 hover:bg-white/10"
              >
                <ZoomIn className="size-4" />
              </Button>
            </>
          )}
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={t("viewer.download")}
            onPress={handleDownload}
            className="rounded-full text-white/80 hover:bg-white/10"
          >
            <Download className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={t("viewer.openTab")}
            onPress={() => window.open(current.url, "_blank", "noopener,noreferrer")}
            className="rounded-full text-white/80 hover:bg-white/10"
          >
            <ExternalLink className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={t("viewer.close")}
            onPress={onClose}
            className="rounded-full text-white/80 hover:bg-white/10"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 pb-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.title || ""}
            draggable={false}
            onWheel={(e) => zoomBy(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)}
            onPointerDown={(e) => {
              if (zoom <= 1) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              pan.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                baseX: offset.x,
                baseY: offset.y,
              };
            }}
            onPointerMove={(e) => {
              if (!pan.current.active) return;
              setOffset({
                x: pan.current.baseX + (e.clientX - pan.current.startX),
                y: pan.current.baseY + (e.clientY - pan.current.startY),
              });
            }}
            onPointerUp={() => {
              pan.current.active = false;
            }}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
            className={`max-h-full max-w-full select-none object-contain transition-transform duration-75 ${
              zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""
            }`}
          />
        ) : kind === "pdf" ? (
          <iframe
            src={current.url}
            title={current.title || "PDF"}
            className="size-full rounded-xl bg-white"
          />
        ) : (
          <p className="text-sm text-white/70">{current.title}</p>
        )}

        {/* Prev / next */}
        {total > 1 && (
          <>
            <Button
              isIconOnly
              variant="ghost"
              aria-label={t("viewer.previous")}
              onPress={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              aria-label={t("viewer.next")}
              onPress={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
