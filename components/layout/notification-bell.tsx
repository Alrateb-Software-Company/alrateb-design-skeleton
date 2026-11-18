"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "@heroui/react";
import { Bell, BellRing, CheckCheck, FolderKanban, ReceiptText, UserPlus, type LucideIcon } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface DemoNotification {
  id: number;
  icon: LucideIcon;
  tone: string;
  titleKey: string;
  bodyKey: string;
  minutesAgo: number;
  read: boolean;
}

// Demo data — a real app loads these from its notifications API.
const SAMPLE: DemoNotification[] = [
  { id: 1, icon: UserPlus, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400", titleKey: "notifications.sample.customerTitle", bodyKey: "notifications.sample.customerBody", minutesAgo: 4, read: false },
  { id: 2, icon: ReceiptText, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", titleKey: "notifications.sample.paymentTitle", bodyKey: "notifications.sample.paymentBody", minutesAgo: 52, read: false },
  { id: 3, icon: FolderKanban, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400", titleKey: "notifications.sample.projectTitle", bodyKey: "notifications.sample.projectBody", minutesAgo: 60 * 26, read: true },
];

/** Topbar bell + popover panel (same anatomy as the production bell, with static demo data). */
export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(SAMPLE);
  const [now] = useState(() => Date.now());
  const unread = items.filter((n) => !n.read).length;
  const label = unread ? `${t("notifications.title")} (${unread})` : t("notifications.title");
  const markRead = (id: number) => setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={label}
        className={`relative flex size-9 h-auto min-w-0 items-center justify-center rounded-full p-0 shadow-none transition ${open ? "bg-black/5 text-neutral-800 dark:bg-white/10 dark:text-neutral-100" : "bg-transparent text-neutral-500 hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5"}`}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-semibold leading-4 text-white tabular-nums ring-2 ring-app-surface">{unread}</span>
        )}
      </Popover.Trigger>
      <Popover.Content placement="bottom end" className="w-[25rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl p-0">
        <Popover.Dialog aria-label={t("notifications.title")} className="p-0">
          <div className="flex items-center gap-2 px-4 pb-2 pt-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{t("notifications.title")}</h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => setItems((l) => l.map((n) => ({ ...n, read: true })))}
                className="ms-auto flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-sky-600 transition hover:bg-sky-500/10 active:scale-95 dark:text-sky-400"
              >
                <CheckCheck className="size-4" />
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-[min(28rem,calc(100dvh-11rem))] overflow-y-auto overscroll-contain border-t border-app-border">
            {items.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="mb-3 flex size-14 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                  <BellRing className="size-6" />
                </span>
                <p className="text-sm font-semibold">{t("notifications.empty")}</p>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const Icon = n.icon;
                  return (
                    <li key={n.id} className="relative">
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className={`flex w-full gap-3 px-4 py-2.5 text-start outline-none transition hover:bg-neutral-500/[0.06] focus-visible:bg-neutral-500/10 ${!n.read ? "bg-sky-500/[0.035] pe-11" : ""}`}
                      >
                        <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${n.tone}`}>
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`line-clamp-2 block text-sm leading-snug ${!n.read ? "font-semibold text-neutral-900 dark:text-white" : "font-medium text-neutral-700 dark:text-neutral-300"}`}>{t(n.titleKey)}</span>
                          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{t(n.bodyKey)}</span>
                          <span className="mt-1 block text-[11px] text-neutral-400">{timeAgo(new Date(now - n.minutesAgo * 60_000), i18n.language)}</span>
                        </span>
                      </button>
                      {!n.read && <span className="pointer-events-none absolute end-5 top-5 size-2.5 rounded-full bg-sky-500" aria-hidden />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
