"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";
import { Eraser, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { InlineSwatchPicker } from "@/components/ui/color-picker";

const INK = "#1e293b";
/** Classic signature ink colors. */
const INK_COLORS = ["#1e293b", "#000000", "#1d4ed8", "#0284c7", "#7c3aed", "#b91c1c", "#047857"];

/**
 * Draw-a-signature dialog: transparent-background canvas exported as PNG and
 * uploaded through /api/upload (same storage as other school branding assets).
 */
export function SignaturePadModal({
  open,
  onClose,
  fileName,
  onUploaded,
  onDataUrl,
  purpose,
}: {
  open: boolean;
  onClose: () => void;
  /** Fixed base name (no extension) — overwrites the same file on re-save. */
  fileName: string;
  onUploaded?: (path: string) => void;
  /** Unauthenticated contexts (public e-sign): receive the PNG data URL instead of uploading. */
  onDataUrl?: (dataUrl: string) => Promise<void> | void;
  /** Upload purpose (lib/files); default branding with overwrite. Other purposes get a unique name each save. */
  purpose?: string;
}) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [ink, setInk] = useState(INK);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ink;
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.strokeStyle = ink;
  }, [ink]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function strokeTo(p: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setDirty(false);
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas || !dirty || saving) return;
    setSaving(true);
    try {
      if (onDataUrl) {
        await onDataUrl(canvas.toDataURL("image/png"));
        onClose();
        return;
      }
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const form = new FormData();
      if (purpose) {
        form.append("purpose", purpose);
      } else {
        form.append("folder", "branding");
        form.append("overwrite", "1");
      }
      form.append("fileName", fileName);
      form.append("file", new File([blob], `${fileName}.png`, { type: "image/png" }));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.path) {
        onUploaded?.(data.path);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("settings.pdfSign.drawTitle")}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-neutral-400">{t("settings.pdfSign.drawHint")}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-500">{t("settings.pdfSign.inkColor")}</span>
          <InlineSwatchPicker
            label={t("settings.pdfSign.inkColor")}
            value={ink}
            colors={INK_COLORS}
            onChange={setInk}
          />
        </div>
        <canvas
          ref={canvasRef}
          className="h-48 w-full cursor-crosshair rounded-2xl border border-dashed border-neutral-300 bg-white"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            last.current = point(e);
            strokeTo({ x: last.current.x + 0.1, y: last.current.y + 0.1 });
            setDirty(true);
          }}
          onPointerMove={(e) => {
            if (drawing.current) strokeTo(point(e));
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onPress={clear} isDisabled={!dirty || saving}>
            <Eraser className="size-4" />
            {t("settings.pdfSign.clear")}
          </Button>
          <Button size="sm" onPress={save} isDisabled={!dirty} isPending={saving}>
            <Check className="size-4" />
            {t("settings.pdfSign.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
