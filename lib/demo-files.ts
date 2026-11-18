/** Demo-only in-memory file store (cleared on restart). Swap for disk/S3 in a real app. */

interface StoredFile {
  type: string;
  data: Buffer;
}

const globalStore = globalThis as unknown as { __demoFiles?: Map<string, StoredFile> };
export const demoFiles: Map<string, StoredFile> = (globalStore.__demoFiles ??= new Map());

const MAX_FILES = 200;

export function putDemoFile(name: string, type: string, data: Buffer): string {
  const dot = name.lastIndexOf(".");
  const ext = dot === -1 ? "bin" : name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `${crypto.randomUUID()}.${ext}`;
  demoFiles.set(key, { type, data });
  // Keep the demo bounded.
  while (demoFiles.size > MAX_FILES) demoFiles.delete(demoFiles.keys().next().value!);
  return `/api/files/${key}`;
}
