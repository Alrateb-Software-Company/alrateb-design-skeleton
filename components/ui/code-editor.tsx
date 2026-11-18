"use client";

// Lightweight HTML code editor used by the landing builder's code mode.
// Loaded via next/dynamic (ssr: false) — CodeMirror is client-only.

import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

export type { ReactCodeMirrorRef };

const EXTENSIONS = [html()];

export default function CodeEditor({
  value,
  onChange,
  height = "46vh",
  ariaLabel,
  editorRef,
}: {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  ariaLabel?: string;
  editorRef?: React.MutableRefObject<ReactCodeMirrorRef | null>;
}) {
  return (
    <div dir="ltr" className="overflow-hidden rounded-xl border border-default-200 text-start [&_.cm-editor]:text-[13px]" aria-label={ariaLabel}>
      <CodeMirror
        ref={editorRef}
        value={value}
        height={height}
        theme="light"
        extensions={EXTENSIONS}
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: true }}
        onChange={onChange}
      />
    </div>
  );
}
