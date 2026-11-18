"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@heroui/react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarNav } from "@/components/layout/nav";
import { MobileTabBar, SidebarBrand } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import { NAV_ITEMS, isNavItemActive } from "@/config/nav";
import { useUserPreference } from "@/hooks/useUserPreference";

const SIDEBAR_EXPANDED = "w-64";
const SIDEBAR_RAIL = "w-[4.5rem]";

/** Sidebar (desktop) + topbar + bottom tab bar (phones) around every dashboard page. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useUserPreference<boolean>("ui.sidebarCollapsed", false);

  const activeItem = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));
  const title = activeItem ? t(activeItem.labelKey) : t("nav.dashboard");
  const ToggleIcon = sidebarCollapsed ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = sidebarCollapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex min-h-0 w-full flex-1">
        <aside
          data-collapsed={sidebarCollapsed ? "" : undefined}
          className={`fixed inset-y-0 start-0 z-30 hidden flex-col border-e border-app-border bg-app-surface transition-[width] duration-200 ease-out md:flex ${
            sidebarCollapsed ? SIDEBAR_RAIL : SIDEBAR_EXPANDED
          }`}
        >
          <SidebarBrand collapsed={sidebarCollapsed} />
          <SidebarNav collapsed={sidebarCollapsed} />
          <div className={`border-t border-app-border p-2 ${sidebarCollapsed ? "flex justify-center" : "flex justify-end"}`}>
            <Tooltip delay={300} closeDelay={0} isDisabled={!sidebarCollapsed}>
              <Tooltip.Trigger
                render={(props) => (
                  <button
                    {...(props as unknown as React.ComponentPropsWithRef<"button">)}
                    type="button"
                    aria-label={toggleLabel}
                    aria-expanded={!sidebarCollapsed}
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`flex h-9 items-center gap-2 rounded-xl px-2.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/40 dark:hover:bg-white/5 dark:hover:text-neutral-200 ${
                      sidebarCollapsed ? "w-9 justify-center px-0" : ""
                    }`}
                  >
                    <ToggleIcon className="size-4 shrink-0 rtl:-scale-x-100" />
                    {!sidebarCollapsed && <span>{toggleLabel}</span>}
                  </button>
                )}
              />
              <Tooltip.Content placement="end">{toggleLabel}</Tooltip.Content>
            </Tooltip>
          </div>
        </aside>

        <div className={`flex min-h-screen w-full flex-col transition-[padding] duration-200 ease-out ${sidebarCollapsed ? "md:ps-[4.5rem]" : "md:ps-64"}`}>
          <Topbar title={title} />
          <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>

        <MobileTabBar />
      </div>
    </div>
  );
}
