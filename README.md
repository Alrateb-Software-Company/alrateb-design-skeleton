# Alrateb Design Skeleton

A starter for Alrateb products. It has the same look, components and patterns as our production systems, with no backend attached. Use it to start a new system or as a reference while building screens.

**Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) before building UI.**

## What's inside

- **Login page:** `/login`. A demo session is stored in a cookie.
- **Dashboard shell:**
  - collapsible, grouped sidebar with attention badges and "Soon" items;
  - topbar with notifications, theme and language;
  - bottom tab bar and slide-in menu on phones.
- **Sample pages:**
  - `/dashboard`: home with hero stats, a needs-attention card, module blocks and quick actions.
  - `/dashboard/customers`: a full list page with filters, sort, saved presets, column settings, bulk selection, add/edit modal, delete confirmation and pagination.
  - `/dashboard/projects`: tabs with a board, a list and an activity feed, plus a "new project" form.
  - `/dashboard/settings`: form sections, pickers, file upload and switches.
  - `/dashboard/invoices` and `/dashboard/reports`: "coming soon" placeholders.
- **Component showcase:** `/dashboard/components`. Every UI component, live, with copyable code.
- **Icon gallery:** `/dashboard/icons`. All lucide-react icons, searchable; click one to copy its JSX.
- **English + Arabic (RTL)** and **light + dark** throughout.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with **demo@alrateb.com** / **demo1234** (any email and a password of 4+ characters also work).

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

## Project structure

```
app/
  login/                  sign-in page
  dashboard/              shell layout + one folder per page
  api/upload, api/files   demo in-memory file store for <FileUpload> (cleared on restart)
  globals.css             design tokens (colours, surfaces) and global fixes
components/
  ui/                     the design-system components (use these)
  layout/                 sidebar, topbar, mobile nav, shell
  auth/ dashboard/ customers/ projects/ settings/   sample feature views
  showcase/               the /dashboard/components page
config/
  app.ts                  product name, default country / currency / timezone
  nav.ts                  sidebar sections and items
hooks/                    list filters, table columns, persisted state/tabs, media queries
lib/
  i18n.ts                 i18next setup, switchLocale()
  format.ts               dates, times, numbers
  session.ts              demo auth (replace with your real auth)
  demo-data.ts            sample customers and projects (replace with API calls)
locales/en.json, ar.json  all UI strings
```

## Starting a new product from this

1. Set the product name in `config/app.ts`. It appears in every string through `{{app}}`.
2. If the brand colours differ, change the `sky-*` / `violet-*` scales and `--accent` in `app/globals.css`.
3. Replace `lib/session.ts` with real auth, and `lib/demo-data.ts` with API calls.
4. Edit `config/nav.ts` and add pages by following "Adding a page" in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#adding-a-page).
5. Delete the sample feature folders you don't need. Keep `components/ui`, `components/layout` and the showcase.
