import { NextResponse } from "next/server";
import { putDemoFile } from "@/lib/demo-files";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|gif|webp)|application\/pdf|text\/csv|application\/vnd\.openxmlformats-officedocument\..+|application\/msword|application\/vnd\.ms-excel)$/;

/**
 * Demo upload endpoint used by <FileUpload> and <SignaturePadModal>: { file, fileName? } -> { path }.
 * Files live in memory only (see lib/demo-files.ts). Replace with real storage that returns a servable `path`.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  if (!ALLOWED.test(file.type)) return NextResponse.json({ error: "file_type_not_allowed" }, { status: 415 });

  const path = putDemoFile(file.name, file.type, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ path });
}
