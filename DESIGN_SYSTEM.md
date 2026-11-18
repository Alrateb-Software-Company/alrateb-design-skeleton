# Alrateb Design System

How every Alrateb product should look and be built, UI-wise. This skeleton is the reference implementation: copy it to start a new system, and keep new screens consistent with what is here.

- **Live catalogue:** `/dashboard/components` (every component, with code you can copy)
- **Icons:** `/dashboard/icons` (searchable lucide gallery, click to copy)
- **Reference pages:** `/dashboard/customers` (list + CRUD), `/dashboard/projects` (tabs, board, activity), `/dashboard/settings` (forms)

---

## 1. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 | Server layouts, client views |
| Components | [HeroUI v3](https://heroui.com) (`@heroui/react`) | Built on React Aria: accessible by default |
| Styling | Tailwind CSS v4 | Utility classes only, tokens in `app/globals.css` |
| Icons | [lucide-react](https://lucide.dev) | The only icon set |
| i18n | i18next + react-i18next | English + Arabic (RTL), JSON in `locales/` |
| Dates | `@internationalized/date` (pickers), `lib/format.ts` (display) | |

**Rule zero:** if a wrapper exists in `components/ui/`, use it rather than the raw HeroUI component or a hand-built one. The wrappers already handle RTL, dark mode, mobile, labels and the edge cases we have hit in production.

---

## 2. Colour

### Brand scales

The Tailwind `sky-*` and `violet-*` scales are **re-mapped** in `globals.css`:

| Token | Meaning | Brand colour |
| --- | --- | --- |
| `sky-*` | **Primary** | Teal (`sky-600` = `#0f766e`) |
| `violet-*` | **Secondary** | Gold (`violet-500` = `#c29a4b`) |
| `bg-accent` / `text-accent` / `--accent` | HeroUI accent | Same teal as `sky-600` |

So `text-sky-600` means "brand primary", not light blue. To rebrand a product, change those two scales and `--accent` in `globals.css`; nothing else needs to change.

Only shades **50, 300, 400, 500, 600, 700 and 950** are re-mapped. `100`, `200`, `800` and `900` are still stock Tailwind blue/purple, so never use them. For a soft fill use an opacity instead (`bg-sky-500/10`).

### Surfaces

| Utility | Use for |
| --- | --- |
| `bg-app-bg` | Page background (set on `body` already) |
| `bg-app-surface` | Cards, panels, tables, empty states |
| `border-app-border` | Hairline borders on surfaces |
| `text-neutral-500` | Hints, subtitles, secondary text |
| `text-neutral-400` | Placeholder icons, very quiet text |

### Status

Use HeroUI colour props (`color="success" | "warning" | "danger" | "accent" | "default"`) on `Chip`, `Alert`, `Button` and similar components. When you need raw classes, use emerald (good), amber (attention), red/rose (bad) and neutral (inactive).

### Tints (icon tiles)

Soft square icon backgrounds come from `TINT` in `components/ui/dashboard-blocks.tsx`. The keys are `accent`, `gold`, `emerald`, `amber`, `rose`, `indigo` and `neutral`. Do not invent new tint combinations.

```tsx
<span className={`flex size-10 items-center justify-center rounded-2xl ${TINT.emerald}`}><Wallet className="size-5" /></span>
```

### Dark mode

- Dark mode is a `.dark` class on `<html>`. It is toggled from the topbar menu and saved in `localStorage.theme` (the system preference is used until the user chooses).
- Every colour class that isn't a token needs a `dark:` partner (`text-sky-600 dark:text-sky-400`).
- Tokens (`bg-app-surface`, `bg-accent`) switch on their own.
- Check every new screen in both themes.

---

## 3. Typography

| Role | Classes |
| --- | --- |
| Page title (`PageHeader`) | `text-xl font-semibold tracking-tight` |
| Section title | `text-base font-semibold` |
| Card title | `text-sm font-semibold` |
| Body | `text-sm` |
| Hint / secondary | `text-sm text-neutral-500` (or `text-xs`) |
| Overline | `text-xs font-medium uppercase tracking-wide text-neutral-500` |
| Numbers in tables / stats | add `tabular-nums` |

Fonts:

- **Inter** for Latin and **Boutros Jazirah Text** for Arabic, with **Cairo** as the fallback.
- They are wired in `app/layout.tsx` and `globals.css`. Never set `font-family` on a component.

The default size for app UI is `text-sm`. Reserve larger sizes for headings and hero numbers.

---

## 4. Shape, elevation and spacing

| What | Value |
| --- | --- |
| Cards, panels, tables, empty states | `rounded-3xl bg-app-surface shadow-sm` |
| Inner tiles, icon squares, inputs | `rounded-2xl` / `rounded-xl` |
| Chips, pills, avatars | `rounded-full` |
| Hero / overlays | `shadow-lg` (overlays get theirs from HeroUI) |
| Page padding | Provided by the shell (`p-4 md:p-6`). Don't add your own. |
| Page width | `mx-auto max-w-7xl` for lists, `max-w-4xl` for forms and settings |
| Vertical rhythm | `flex flex-col gap-4` between page blocks, `gap-6` between big sections |

Prefer `gap-*` over margins. Avoid hard borders between blocks; separate them with surface and spacing.

---

## 5. RTL and Arabic

Every screen must work in Arabic. These rules prevent most RTL bugs:

1. **Logical properties only.** Use `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `rounded-s-*`/`rounded-e-*` and `border-s`/`border-e`. Never use `ml`, `mr`, `pl`, `pr`, `left`, `right`, `text-left` or `text-right`.
2. **Directional icons flip.** Chevrons and arrows that mean "forward/back" get `rtl:rotate-180`. Icons that don't point somewhere (Search, User, Trash) never flip.
3. **LTR islands.** Emails, phone numbers, URLs, codes and IBANs get `dir="ltr"` (plus `className="text-start"` if they must align with the column).
4. **Bilingual fields.** A form with English and Arabic name inputs sets `dir="ltr"` / `dir="rtl"` on each `<Input>`.
5. **Numbers.** Arabic UI uses Latin digits. Format with `Intl.NumberFormat(lang === "ar" ? "ar-u-nu-latn" : "en")` or the helpers in `lib/format.ts`.
6. **Drawers** open from the end edge, which is left in Arabic: `placement={isAr ? "left" : "right"}`. Physical placement does not flip on its own.

---

## 6. Text and i18n

- **No hard-coded UI strings.** Every label goes through `t("namespace.key")` and exists in **both** `locales/en.json` and `locales/ar.json`.
- Name keys by feature: `customers.fields.email`, `projects.stage.review`. Shared words (`common.save`, `common.cancel`, `common.delete`, `common.status`) live in `common`.
- Use the product name through `{{app}}`, which i18next fills from `config/app.ts`. Never write "Alrateb" into a string.
- Plurals use i18next suffixes: `_one`/`_other` in English; Arabic also has `_zero`, `_two`, `_few` and `_many`. Call it as `t("customers.bulkDeleted", { count })`.
- For keys built from data (`t(\`customers.status.${s}\`)`), keep the full set of values in the JSON. A missing key shows the raw key on screen.
- Save locale files as UTF-8 without BOM. Don't paste Arabic through a terminal pipe, which can turn it into `???`.
- Switch language with `switchLocale("ar" | "en")` from `lib/i18n.ts`. It sets a cookie, and the root layout renders `lang`/`dir` on the server.

---

## 7. Icons

- **lucide-react only.** Import each icon by name: `import { Users } from "lucide-react"`. Browse and copy them at `/dashboard/icons`.
- Use these sizes:

| Context | Size |
| --- | --- |
| Inline in buttons, menus, table cells, chips | `size-4` |
| Dense meta (small chips, contact lines) | `size-3` / `size-3.5` |
| `PageHeader` and stat tiles | `size-5` |
| Empty states, feature tiles | `size-6` |

- Icon-only buttons **must** have an `aria-label` and should have a `Tooltip`.
- Icons inherit colour (`currentColor`). Colour the parent, not the icon, unless the icon is the only coloured element.
- One icon per concept across the product, e.g. `Users` for customers everywhere and `FolderKanban` for projects. The sidebar defines the canonical icon for each module.

---

## 8. Components: which one to use

All of these live in `components/ui/` and are demonstrated at `/dashboard/components`.

### Actions

| Need | Use |
| --- | --- |
| Main action | `<Button>` (primary, the default). **One primary per view.** |
| Secondary action | `<Button variant="secondary">` |
| Cancel in dialogs and forms | `<Button variant="tertiary">` |
| Icon / row actions | `<Button variant="ghost" isIconOnly aria-label>` |
| Destructive | `variant="danger"` in confirmations, `variant="danger-soft"` inline |
| Navigation that looks like a button | `LinkButton` (`link-button.tsx`), never `<Button onPress={router.push}>` |
| Loading | `isPending`, never a spinner beside the button |
| Segmented choice | HeroUI `ToggleButtonGroup` |
| Status or label | `Chip size="sm" variant="soft" color=…` |
| Count | `Badge` |
| Person | `UserAvatar` (initials fallback, deterministic colour) |
| Menu of row actions | `Dropdown` |

### Forms

| Need | Use |
| --- | --- |
| Text / email / number | HeroUI `TextField` + `Label` + `Input` with `variant="secondary"` |
| Password | `PasswordField` (show/hide toggle) |
| Phone | `PhoneInput` (country dial code, LTR) |
| One of a few options | `AppSelect` |
| One of many / searchable | `AppAutocomplete` |
| Several values | `AppMultiSelect` / `AppMultiAutocomplete` |
| Free tags | `CreatableMultiPicker` / `CreatableSinglePicker` |
| Server-side search | `RemotePicker` |
| Country / currency / timezone | `CountrySelect`, `CurrencySelect`, `TimezoneSelect` |
| Date / time / date-time / range | `AppDatePicker`, `AppTimePicker`, `AppDateTimePicker`, `AppDateRangePicker` |
| On/off setting | `AppSwitch` (label + description) |
| Consent | HeroUI `Checkbox` |
| Colour | `AppColorField` (full) or `InlineSwatchPicker` (preset swatches) |
| Repeating schedule | `RecurrenceField` |
| Weekly hours | `AvailabilityEditor` |
| One-time code | `OtpInput` |
| Files | `FileUpload` → show results with `FileCard` |
| Signature | `SignaturePadModal` |
| Code / JSON / HTML | `CodeEditor` (load with `next/dynamic`, `ssr: false`) |

Form layout:

```tsx
<FormSection icon={<Building2 className="size-4" />} title={t("settings.org.title")} hint={t("settings.org.hint")}>
  <FormGrid>{/* 2 columns on sm+, 1 on phones; cols={3} for dense forms */}</FormGrid>
</FormSection>
<FormFooter error={error}>
  <Button variant="tertiary" onPress={onClose}>{t("common.cancel")}</Button>
  <Button type="submit" isPending={busy}>{t("common.save")}</Button>
</FormFooter>
```

- Validation errors sit in `FormFooter error=…` (form level) or on the field (`isInvalid` + `FieldError`).
- Never use `alert()`.
- Required fields get `isRequired`. Don't add asterisks by hand.

### Data and lists

| Need | Use |
| --- | --- |
| Any table | `DataTable`. It turns into `RecordCard`s on narrow screens automatically. Use `framed` for a stand-alone list. |
| Column show/hide/reorder | `useTableColumns(key, defs)` + `ColumnSettingsButton` |
| Filters | `FilterBar` holding `SearchField`, `FilterSelect`, `FilterMultiSelect`, `FilterAutocomplete`, `SortSelect` and `FilterPresets`. On phones the filters fold into a sheet automatically. |
| Filter state in the URL | `useListFilters(key, defaults)` |
| Quick filters | `ChipRow` + `FilterChip` |
| "Needs attention" counters | `NeedsAttentionBar`; per-row warnings with `GapBadges` |
| Money | `<Money amount currency />`. Never format currency by hand. |
| Pagination | `ListPagination` in the `DataTable` `footer` |
| Nothing to show | `EmptyState` (first-use: an action to create; filtered to nothing: an action to clear filters) |

### Overlays and feedback

| Need | Use |
| --- | --- |
| Create/edit form | `Modal` (`wide` for 2-column forms, `xwide` for row editors). Reset the form per opening with `useModalSessionKey`. |
| "Are you sure?" | `ConfirmDialog`. The message names what will be lost. |
| Side details that keep the page visible | HeroUI `Drawer` |
| Images / PDFs | `MediaViewer` |
| Result of an action | `toast.success / .danger / .warning / .info`, short and in the past tense ("Saved") |
| Persistent message on a page | `Alert` (status: default, accent, success, warning, danger) |
| Feature switched off for this tenant | `FeatureDisabledNotice` |
| Loading | `Skeleton` for content shapes, `Spinner` for small areas, `isPending` on buttons |

Modals are **not dismissable** by clicking outside or by Escape, so unsaved input is never lost. That is intentional; don't override it.

### Page and dashboard

| Need | Use |
| --- | --- |
| Top of every page | `PageHeader` (title, subtitle, icon, one primary `action`, optional `extra`) |
| Plain surface | `Card` from HeroUI, or `rounded-3xl bg-app-surface p-5 shadow-sm` |
| Home page hero | `AccentHero` + `HeroStats` (**one per home page**) |
| Module summary tiles | `StatBlockCard` (with `TINT`) |
| To-do list | `AttentionCard` |
| Dated list | `DatedRow` |
| Shortcuts | `QuickActions` |
| Section heading with "see all" | `SectionHead` / `SectionLink` |
| Unbuilt module | `ComingSoon` (`components/layout/coming-soon.tsx`) |

---

## 9. Page anatomy

Every list page follows the same order. Copy `components/customers/customers-view.tsx`:

```
PageHeader            title · subtitle (count) · icon · primary action
FilterBar             search · filters · sort · presets · column settings
(bulk selection bar)  only while rows are selected
DataTable (framed)    rows → cards on mobile · emptyState · ListPagination footer
Modal / ConfirmDialog create/edit · delete
```

Detail and settings pages stack `FormSection`s inside `max-w-4xl`, with one `FormFooter`.

The home page is `AccentHero` (with greeting and `HeroStats`), then the `AttentionCard`, then a grid of `StatBlockCard`s, then a dated list and `QuickActions`.

### Adding a page

1. Create `components/<feature>/<feature>-view.tsx` (a `"use client"` view).
2. Create `app/dashboard/<feature>/page.tsx`, which renders the view, wrapped in `<Suspense>` if it reads search params.
3. Add a `NavItem` to `config/nav.ts` with `href`, `labelKey` and a lucide `icon`. Use `soon: true` until the page exists. The topbar title comes from the same `labelKey`.
4. Add `nav.<feature>` and the `<feature>.*` strings to **both** locale files.
5. Check it at desktop and phone widths, in light and dark, in English and Arabic.

---

## 10. Responsive

- Design mobile-first. The shell already switches to a bottom tab bar and a slide-in menu under `md`.
- Grids: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3`. Never use fixed widths that overflow a 360px screen.
- Tables need no extra work, because `DataTable` turns into cards.
- Make sure nothing scrolls sideways at 360px.
- Touch targets are at least 36px. HeroUI `size="sm"` buttons are the smallest allowed.

---

## 11. Accessibility

- Use HeroUI / React Aria components for anything interactive. They bring keyboard and screen-reader support.
- Every input has a visible `Label`. If a design truly has none, use `aria-label`.
- Icon-only buttons need `aria-label`. Decorative icons are ignored automatically (lucide renders `aria-hidden`).
- Don't convey meaning by colour alone: pair it with text or an icon (status chips have labels).
- Respect `prefers-reduced-motion`: use the `anim-*` classes from `globals.css`, which do nothing when motion is reduced.

---

## 12. Do / don't

| Do | Don't |
| --- | --- |
| Use `components/ui` wrappers | Re-style raw HeroUI per page |
| `sky-*` / `violet-*` / `bg-accent` / `TINT` | Arbitrary hex colours or `bg-[#…]` |
| `ms-`, `pe-`, `start-`, `text-start` | `ml-`, `pr-`, `left-`, `text-left` |
| `t("key")` in both locales | Hard-coded English or Arabic |
| One primary button per view | Several primary buttons competing |
| Toasts for results, `ConfirmDialog` for destructive actions | `alert()` / `confirm()` |
| `Money`, `fmtDate`, `timeAgo` | Hand-formatted numbers and dates |
| lucide icons at the standard sizes | Other icon packs, SVGs pasted inline, emoji as icons |
| `EmptyState` with a next step | Blank areas or a bare "No data" |
| `rounded-3xl bg-app-surface shadow-sm` cards | Heavy borders and drop shadows |
