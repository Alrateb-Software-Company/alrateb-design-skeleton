import { demoFiles } from "@/lib/demo-files";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = demoFiles.get(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "content-type": file.type, "cache-control": "private, max-age=3600", "x-content-type-options": "nosniff" },
  });
}
