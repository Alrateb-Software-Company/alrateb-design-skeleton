import { BarChart3, Blocks, FolderKanban, LayoutDashboard, ReceiptText, Settings, Shapes, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  /** i18n key of the label (also used as the page title in the topbar). */
  labelKey: string;
  icon: LucideIcon;
  /** Not built yet — shown dimmed with a "Soon" tag so the IA is visible from day one. */
  soon?: boolean;
  /** Demo "needs your attention" count; real apps compute it from the API. */
  badge?: { count: number; tone: "mine" | "queue" };
}

export interface NavSection {
  key: string;
  labelKey: string;
  items: NavItem[];
}

/**
 * The sidebar, grouped. The first section ("overview") renders without a heading.
 * Add a page: create app/dashboard/<slug>/page.tsx, add an item here and a `nav.<key>` label in both locales.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    key: "overview",
    labelKey: "nav.sections.overview",
    items: [{ href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard }],
  },
  {
    key: "workspace",
    labelKey: "nav.sections.workspace",
    items: [
      { href: "/dashboard/customers", labelKey: "nav.customers", icon: Users, badge: { count: 3, tone: "mine" } },
      { href: "/dashboard/projects", labelKey: "nav.projects", icon: FolderKanban, badge: { count: 2, tone: "queue" } },
    ],
  },
  {
    key: "finance",
    labelKey: "nav.sections.finance",
    items: [
      { href: "/dashboard/invoices", labelKey: "nav.invoices", icon: ReceiptText, soon: true },
      { href: "/dashboard/reports", labelKey: "nav.reports", icon: BarChart3, soon: true },
    ],
  },
  {
    key: "system",
    labelKey: "nav.sections.system",
    items: [
      { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
      { href: "/dashboard/components", labelKey: "nav.components", icon: Blocks },
      { href: "/dashboard/icons", labelKey: "nav.icons", icon: Shapes },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

/** Exact match for the dashboard root, prefix match for everything else. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
