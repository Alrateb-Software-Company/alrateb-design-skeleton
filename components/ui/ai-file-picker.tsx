"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";
import { FileText, FileUp, X } from "lucide-react";

export interface AiFilePayload {
  name: string;
  mimeType: string;
  /** Base64 file content (no data: prefix). */
  data: string;
}

const ACCEPT = ".pdf,.docx,image/*";
const MAX_BYTES = 15 * 1024 * 1024;

/** Pick a PDF/DOCX/image and hand it over as a base64 payload for AI extraction. */
export function AiFilePicker({
  file,
  onChange,
  isDisabled,
}: {
  file: AiFilePayload | null;
  onChange: (file: AiFilePayload | null) => void;
  isDisabled?: boolean;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    setError(null);
    if (picked.size > MAX_BYTES) {
      setError(t("locationSets.import.tooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const data = result.slice(result.indexOf(",") + 1);
      if (!data) {
        setError(t("locationSets.import.invalidFile"));
        return;
      }
      onChange({ name: picked.name, mimeType: picked.type || "application/octet-stream", data });
    };
    reader.onerror = () => setError(t("locationSets.import.invalidFile"));
    reader.readAsDataURL(picked);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={handleSelect} />
      {file ? (
        <div className="flex items-center gap-2 rounded-xl bg-app-bg px-3 py-2">
          <FileText className="size-4 shrink-0 text-sky-500" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
          <Button isIconOnly variant="ghost" size="sm" isDisabled={isDisabled} onPress={() => onChange(null)}>
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="tertiary" size="sm" isDisabled={isDisabled} onPress={() => inputRef.current?.click()}>
            <FileUp className="size-3.5" />
            {t("locationSets.import.chooseFile")}
          </Button>
          <span className="text-xs text-neutral-500">{t("locationSets.import.fileHint")}</span>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
