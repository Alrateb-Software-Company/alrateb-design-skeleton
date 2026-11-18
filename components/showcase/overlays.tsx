"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Chip, Drawer, ProgressBar, Skeleton, Spinner, toast } from "@heroui/react";
import { Images, PanelRight, PenLine, SquareStack, Trash2 } from "lucide-react";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { MediaViewer } from "@/components/ui/media-viewer";
import { Money } from "@/components/ui/money";
import { SignaturePadModal } from "@/components/ui/signature-pad";
import { UserAvatar } from "@/components/ui/user-avatar";
import { APP_DEFAULTS } from "@/config/app";
import { CUSTOMERS, localName } from "@/lib/demo-data";
import { fmtDate } from "@/lib/format";
import { Example, Row, ShowcaseSection } from "./showcase-kit";

const SAMPLE = CUSTOMERS[0];

// Generated SVGs keep the gallery self-contained (no external image hosts).
const svg = (bg: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="64" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`)}#.svg`;
const MEDIA = [
  { url: svg("#0f766e", "Teal"), title: "teal.svg" },
  { url: svg("#c29a4b", "Gold"), title: "gold.svg" },
  { url: svg("#6366f1", "Indigo"), title: "indigo.svg" },
];

export function OverlaysSection() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [modal, setModal] = useState<"" | "normal" | "wide">("");
  const [confirm, setConfirm] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [media, setMedia] = useState<number | null>(null);
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  return (
    <ShowcaseSection id="overlays" title={t("showcase.sections.overlays")} hint={t("showcase.hints.overlays")}>
      <Example
        title={t("showcase.ex.dialogs")}
        code={`<Modal open={open} onClose={close} title="Edit customer" wide>
  <CustomerForm key={useModalSessionKey(open)} ... />   // fresh state per opening
</Modal>
<ConfirmDialog open={!!target} onClose={...} onConfirm={remove} pending={busy}
  title="Delete customer?" message="This cannot be undone." confirmLabel="Delete" />`}
      >
        <Row>
          <Button variant="secondary" onPress={() => setModal("normal")}>
            <SquareStack className="size-4" />
            Modal
          </Button>
          <Button variant="secondary" onPress={() => setModal("wide")}>
            <SquareStack className="size-4" />
            Modal wide
          </Button>
          <Button variant="danger-soft" onPress={() => setConfirm(true)}>
            <Trash2 className="size-4" />
            ConfirmDialog
          </Button>
          <Button variant="secondary" onPress={() => setDrawer(true)}>
            <PanelRight className="size-4" />
            Drawer
          </Button>
          <Button variant="secondary" onPress={() => setMedia(0)}>
            <Images className="size-4" />
            MediaViewer
          </Button>
          <Button variant="secondary" onPress={() => setSigning(true)}>
            <PenLine className="size-4" />
            SignaturePad
          </Button>
        </Row>
        {signature && (
          <div className="mt-4 inline-flex rounded-2xl bg-white p-2 ring-1 ring-app-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signature} alt={t("showcase.demo.signature")} className="h-20" />
          </div>
        )}
      </Example>

      <Example title={t("showcase.ex.toasts")} code={`import { toast } from "@heroui/react";\n\ntoast.success(t("common.saved"));\ntoast.danger(errorText(e));\ntoast.warning(...); toast.info(...);`}>
        <Row>
          <Button variant="secondary" onPress={() => toast.success(t("common.saved"))}>
            success
          </Button>
          <Button variant="secondary" onPress={() => toast.danger(t("showcase.demo.toastError"))}>
            danger
          </Button>
          <Button variant="secondary" onPress={() => toast.warning(t("showcase.demo.toastWarning"))}>
            warning
          </Button>
          <Button variant="secondary" onPress={() => toast.info(t("showcase.demo.toastInfo"), { description: t("showcase.demo.toastDescription") })}>
            info
          </Button>
        </Row>
      </Example>

      <Example title={t("showcase.ex.alerts")} code={`<Alert status="warning">\n  <Alert.Indicator />\n  <Alert.Content>\n    <Alert.Title>Heads up</Alert.Title>\n    <Alert.Description>...</Alert.Description>\n  </Alert.Content>\n</Alert>`}>
        <div className="grid gap-3 md:grid-cols-2">
          {(["default", "accent", "success", "warning", "danger"] as const).map((s) => (
            <Alert key={s} status={s}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t(`showcase.alerts.${s}Title`)}</Alert.Title>
                <Alert.Description>{t(`showcase.alerts.${s}Body`)}</Alert.Description>
              </Alert.Content>
            </Alert>
          ))}
        </div>
      </Example>

      <Example title={t("showcase.ex.loading")} code={`<Spinner size="sm" />\n<Skeleton className="h-4 w-40 rounded-lg" />\n<ProgressBar aria-label="Progress" value={64} size="sm" color="success">\n  <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>\n</ProgressBar>`}>
        <div className="grid gap-6 md:grid-cols-3">
          <Row label="Spinner">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" color="warning" />
          </Row>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Skeleton</span>
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">ProgressBar</span>
            {([
              [64, "success"],
              [38, "warning"],
              [85, "accent"],
            ] as const).map(([v, c]) => (
              <ProgressBar key={c} aria-label={c} value={v} size="sm" color={c}>
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            ))}
          </div>
        </div>
      </Example>

      <Modal
        open={!!modal}
        onClose={() => setModal("")}
        title={t("showcase.demo.modalTitle")}
        wide={modal === "wide"}
        footer={
          <>
            <Button variant="tertiary" onPress={() => setModal("")}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={() => {
                setModal("");
                toast.success(t("common.saved"));
              }}
            >
              {t("common.save")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{t("showcase.demo.modalBody")}</p>
      </Modal>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t("customers.deleteTitle")}
        message={t("showcase.demo.confirmBody")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        pending={confirmBusy}
        onConfirm={async () => {
          setConfirmBusy(true);
          await new Promise((r) => setTimeout(r, 700));
          setConfirmBusy(false);
          setConfirm(false);
          toast.success(t("common.deleted"));
        }}
      />

      <Drawer isOpen={drawer} onOpenChange={setDrawer}>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content placement={isAr ? "left" : "right"}>
            <Drawer.Dialog aria-label={t("showcase.demo.drawerTitle")} className="w-full max-w-[100vw] p-0 sm:w-[26rem]">
              <Drawer.Header className="border-b border-app-border px-5 py-4">
                <Drawer.Heading className="text-base font-semibold">{t("showcase.demo.drawerTitle")}</Drawer.Heading>
                <Drawer.CloseTrigger aria-label={t("common.close")} />
              </Drawer.Header>
              <Drawer.Body className="m-0 space-y-3 px-5 py-5 text-sm text-neutral-600 dark:text-neutral-300">
                <p>{t("showcase.demo.drawerBody")}</p>
                <div className="flex items-center gap-3 rounded-2xl bg-neutral-500/5 p-3">
                  <UserAvatar name={localName(SAMPLE, i18n.language)} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900 dark:text-white">{localName(SAMPLE, i18n.language)}</p>
                    <p className="truncate text-xs text-neutral-500" dir="ltr">{SAMPLE.email}</p>
                  </div>
                  <Chip size="sm" variant="soft" color="success">{t(`customers.status.${SAMPLE.status}`)}</Chip>
                </div>
                <dl className="divide-y divide-neutral-500/10 rounded-2xl border border-neutral-500/10">
                  {[
                    [t("customers.fields.phone"), <span key="p" dir="ltr">{SAMPLE.phone}</span>],
                    [t("customers.fields.city"), t(`customers.cities.${SAMPLE.city}`)],
                    [t("customers.fields.joined"), fmtDate(SAMPLE.joined, i18n.language)],
                    [t("customers.fields.balance"), <Money key="b" amount={SAMPLE.balance} currency={APP_DEFAULTS.currency} className="tabular-nums" />],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex items-center justify-between gap-3 px-4 py-3">
                      <dt className="text-neutral-500">{k}</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {media !== null && <MediaViewer items={MEDIA} index={media} onIndexChange={setMedia} onClose={() => setMedia(null)} />}

      <SignaturePadModal
        open={signing}
        onClose={() => setSigning(false)}
        fileName="signature"
        onDataUrl={(url) => {
          setSignature(url);
          setSigning(false);
        }}
      />
    </ShowcaseSection>
  );
}
