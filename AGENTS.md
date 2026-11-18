# Agent instructions

Before building or changing any UI, read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) and follow it:

- use the `components/ui/` wrappers;
- use lucide-react icons only;
- use logical (RTL-safe) Tailwind classes;
- put every string in both `locales/en.json` and `locales/ar.json`.

`/dashboard/components` shows each component with example code, and `components/customers/customers-view.tsx` is the reference list page.

This is Next.js 16: `cookies()`, `headers()` and route `params` are async. Check `node_modules/next/dist/docs/` when unsure about an API.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
