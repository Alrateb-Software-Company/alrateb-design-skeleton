"use client";

import { useState, type ReactNode } from "react";
import { Button, Modal as HModal } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { FilterSheetContext } from "@/components/ui/filter-sheet-context";

/**
 * A key that changes every time `open` flips to true. Use it as `key` on a
 * modal's inner content so its state resets per opening while the content
 * stays mounted during the close animation (unmounting it on `!open` freezes
 * HeroUI's exit transition and leaves an empty dialog shell behind).
 */
export function useModalSessionKey(open: boolean): number {
  const [prevOpen, setPrevOpen] = useState(open);
  const [key, setKey] = useState(0);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setKey((k) => k + 1);
  }
  return key;
}

/**
 * Shared dialog built on HeroUI Modal: bottom sheet on mobile, centered on
 * desktop, body scrolls inside so long content never squishes.
 * Not dismissable: Escape and backdrop clicks are ignored so work in
 * progress can't be lost by accident — only the X button closes it.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  xwide,
  hideClose,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  /** Dense row editors (marks entry, bulk tables) — spans most of the viewport on large screens. */
  xwide?: boolean;
  /** Blocking dialogs (forced flows) render without the X button. */
  hideClose?: boolean;
  /** Pinned under the scrolling body so long forms keep their actions in view. */
  footer?: ReactNode;
}) {
  // Callers often clear their state on close (`{form && …}`), which would
  // unmount the content mid-exit and leave React Aria stuck in `data-exiting`
  // (an invisible backdrop that blocks the page). Keep showing the last open
  // render until the exit finishes.
  const live = { title, children, wide, xwide, hideClose, footer };
  const { t } = useTranslation();
  const [held, setHeld] = useState(live);
  if (open && (held.title !== title || held.children !== children || held.wide !== wide || held.xwide !== xwide || held.hideClose !== hideClose || held.footer !== footer)) setHeld(live);
  const view = open ? live : held;
  return (
    <HModal.Backdrop
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      isDismissable={false}
      isKeyboardDismissDisabled
      variant="blur"
    >
      <HModal.Container placement="auto" scroll="inside" size="lg">
        <HModal.Dialog className={view.xwide ? "sm:max-w-5xl" : view.wide ? "sm:max-w-3xl" : undefined}>
          <HModal.Header>
            <HModal.Heading>{view.title}</HModal.Heading>
            {!view.hideClose && <HModal.CloseTrigger aria-label={t("common.close")} />}
          </HModal.Header>
          <HModal.Body><FilterSheetContext.Provider value={false}>{view.children}</FilterSheetContext.Provider></HModal.Body>
          {view.footer && <HModal.Footer className="flex-col items-stretch gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">{view.footer}</HModal.Footer>}
        </HModal.Dialog>
      </HModal.Container>
    </HModal.Backdrop>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  pending,
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  tone?: "danger" | "primary";
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">{message}</div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="tertiary" onPress={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={tone} isPending={pending} onPress={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
