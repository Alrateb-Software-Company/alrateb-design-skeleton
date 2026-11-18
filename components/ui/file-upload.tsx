"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  Paperclip,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

type ItemStatus = "pending" | "uploading" | "done" | "error";

type PickedFile = {
  id: string;
  file: File;
  /** Object URL for image thumbnails; revoked on removal/close. */
  previewUrl: string | null;
  status: ItemStatus;
  error?: string;
};

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Opens an upload dialog (drag & drop + previews), posts to /api/upload and reports stored paths. */
export function FileUpload({
  folder,
  purpose,
  label,
  accept,
  onUploaded,
  fileName: fixedFileName,
  overwrite,
  multiple,
  showFileName,
  onBatchComplete,
  icon,
  variant = "secondary",
}: {
  folder: string;
  /** lib/files FILE_PURPOSES key (allowed types, size, who may read); defaults from the folder. */
  purpose?: string;
  label: string;
  accept?: string;
  /** Awaited per file — uploads are strictly sequential so handlers can't race. Second arg is the original file name. */
  onUploaded: (path: string, originalName: string) => void | Promise<void>;
  /** Fixed base name (no extension) — with `overwrite`, replaces the same file on disk. */
  fileName?: string;
  overwrite?: boolean;
  /** Allow picking several files; onUploaded fires once per file. */
  multiple?: boolean;
  showFileName?: boolean;
  /** Fires once after a batch finished with no errors, with every uploaded path (in order). */
  onBatchComplete?: (paths: string[]) => void | Promise<void>;
  icon?: ReactNode;
  variant?: "secondary" | "primary" | "tertiary" | "ghost";
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<PickedFile[]>([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PickedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [triggerState, setTriggerState] = useState<"idle" | "done" | "error">("idle");
  const [summaryName, setSummaryName] = useState<string | null>(null);
  const showName = showFileName ?? true;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
    };
  }, []);

  function addFiles(files: File[]) {
    const accepted = files.filter((f) => matchesAccept(f, accept));
    if (!accepted.length) return;
    const picked: PickedFile[] = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      status: "pending",
    }));
    setItems((prev) => {
      if (!multiple) {
        prev.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
        return picked.slice(0, 1);
      }
      return [...prev, ...picked];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }

  function closeModal() {
    if (uploading) return;
    itemsRef.current.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
    setItems([]);
    setDragOver(false);
    setOpen(false);
  }

  function errorMessage(status: number, code: string | undefined): string {
    if (code === "malicious_file") return t("upload.errorMalicious");
    if (code === "file_too_large" || status === 413) return t("upload.errorTooLarge");
    if (code === "limit_reached") return t("upload.errorLimit");
    if (code === "scan_unavailable") return t("upload.errorScanUnavailable");
    if (code === "file_type_not_allowed" || code === "invalid_file") return t("upload.errorType");
    if (code === "forbidden" || code === "purpose_not_allowed") return t("upload.errorForbidden");
    return t("upload.errorGeneric");
  }

  async function uploadOne(item: PickedFile): Promise<{ ok: boolean; error?: string; path?: string }> {
    const form = new FormData();
    form.append("folder", folder);
    if (purpose) form.append("purpose", purpose);
    if (fixedFileName) form.append("fileName", fixedFileName);
    if (overwrite) form.append("overwrite", "1");
    form.append("file", item.file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.path) return { ok: false, error: errorMessage(res.status, data.error) };
      // Await the consumer so sequential uploads don't clobber each other's state.
      await onUploaded(data.path, item.file.name);
      return { ok: true, path: data.path as string };
    } catch {
      return { ok: false, error: t("upload.errorGeneric") };
    }
  }

  async function uploadAll() {
    setUploading(true);
    // Includes previously failed items, so pressing Upload again retries them.
    const queue = items.filter((it) => it.status === "pending" || it.status === "error");
    let anyError = false;
    const paths: string[] = [];
    for (const item of queue) {
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: "uploading", error: undefined } : x))
      );
      const result = await uploadOne(item);
      if (!result.ok) anyError = true;
      else if (result.path) paths.push(result.path);
      setItems((prev) =>
        prev.map((x) =>
          x.id === item.id ? { ...x, status: result.ok ? "done" : "error", error: result.error } : x
        )
      );
    }
    setUploading(false);
    setSummaryName(
      queue.length === 1 ? queue[0].file.name : t("upload.filesCount", { count: queue.length })
    );
    setTriggerState(anyError ? "error" : "done");
    if (!anyError) {
      itemsRef.current.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
      setItems([]);
      setOpen(false);
      if (paths.length && onBatchComplete) await onBatchComplete(paths);
    }
  }

  const pendingCount = items.filter((it) => it.status === "pending" || it.status === "error").length;

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) addFiles(files);
          e.target.value = "";
        }}
      />
      <Button variant={variant} size="sm" onPress={() => setOpen(true)}>
        {icon ?? <Paperclip className="size-4" />}
        {label}
      </Button>
      {summaryName && showName && !open && (
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500">
          {triggerState === "done" && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
          {triggerState === "error" && <AlertCircle className="size-4 shrink-0 text-red-500" />}
          <span className="truncate">{summaryName}</span>
        </span>
      )}

      <Modal open={open} onClose={closeModal} title={label}>
        <div
          role="button"
          tabIndex={0}
          aria-label={t("upload.dropTitle")}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(Array.from(e.dataTransfer.files || []));
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
          }`}
        >
          <span className="flex size-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <UploadCloud className="size-6 text-neutral-500" />
          </span>
          <p className="mt-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {t("upload.dropTitle")}
          </p>
          <p className="text-xs text-neutral-500">{t("upload.dropHint")}</p>
          {accept && (
            <p className="text-[11px] text-neutral-400" dir="ltr">
              {[
                ...new Set(
                  accept
                    .split(",")
                    .map((s) =>
                      s
                        .trim()
                        .replace(/^\./, "")
                        .replace(/^[a-z]+\/(?!\*)/i, "")
                        .replace(/\+xml$/i, "")
                        .toUpperCase(),
                    ),
                ),
              ].join(", ")}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700"
              >
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="size-11 shrink-0 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <FileText className="size-5 text-neutral-500" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-neutral-800 dark:text-neutral-100">
                    {item.file.name}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {item.status === "error" && item.error ? (
                      <span className="text-red-500">{item.error}</span>
                    ) : (
                      formatBytes(item.file.size)
                    )}
                  </span>
                </span>
                {item.status === "uploading" && (
                  <Loader2 className="size-4 shrink-0 animate-spin text-neutral-400" />
                )}
                {item.status === "done" && (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                )}
                {item.status === "error" && <AlertCircle className="size-4 shrink-0 text-red-500" />}
                {!uploading && item.status !== "done" && (
                  <button
                    type="button"
                    aria-label={t("upload.remove")}
                    onClick={() => removeItem(item.id)}
                    className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="tertiary" onPress={closeModal} isDisabled={uploading}>
            {t("common.cancel")}
          </Button>
          <Button isPending={uploading} isDisabled={pendingCount === 0} onPress={uploadAll}>
            {t("upload.upload", { count: pendingCount })}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
