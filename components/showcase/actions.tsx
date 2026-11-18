"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Chip, Dropdown, Kbd, Label, Popover, ToggleButton, ToggleButtonGroup, Tooltip } from "@heroui/react";
import { AlignCenter, AlignLeft, AlignRight, ArrowRight, Bell, ChevronDown, Copy, Download, Heart, MoreHorizontal, Pencil, Plus, Settings, Share2, Trash2 } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Example, Row, ShowcaseSection } from "./showcase-kit";

const VARIANTS = ["primary", "secondary", "tertiary", "outline", "ghost", "danger", "danger-soft"] as const;
const CHIP_COLORS = ["default", "accent", "success", "warning", "danger"] as const;

export function ActionsSection() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [align, setAlign] = useState("start");
  const [pending, setPending] = useState(false);

  return (
    <ShowcaseSection id="actions" title={t("showcase.sections.actions")} hint={t("showcase.hints.actions")}>
      <Example
        title={t("showcase.ex.buttons")}
        code={`<Button>Save</Button>                       // primary: one per view
<Button variant="secondary">Export</Button>
<Button variant="tertiary">Cancel</Button>   // cancel in dialogs
<Button variant="ghost" isIconOnly aria-label="Edit"><Pencil className="size-4" /></Button>
<Button variant="danger-soft"><Trash2 className="size-4" />Delete</Button>
<Button isPending={saving}>Save</Button>`}
      >
        <div className="flex flex-col gap-5">
          <Row label="variant">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </Row>
          <Row label="size">
            <Button size="sm">{t("showcase.demo.small")}</Button>
            <Button size="md">{t("showcase.demo.medium")}</Button>
            <Button size="lg">{t("showcase.demo.large")}</Button>
          </Row>
          <Row label="icons">
            <Button>
              <Plus className="size-4" />
              {t("showcase.demo.create")}
            </Button>
            <Button variant="secondary">
              {t("showcase.demo.continue")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
            <Button isIconOnly variant="ghost" aria-label={t("common.edit")}>
              <Pencil className="size-4" />
            </Button>
            <Button isIconOnly variant="secondary" aria-label={t("showcase.demo.share")}>
              <Share2 className="size-4" />
            </Button>
            <Button isIconOnly variant="danger-soft" aria-label={t("common.delete")}>
              <Trash2 className="size-4" />
            </Button>
          </Row>
          <Row label="state">
            <Button
              isPending={pending}
              onPress={() => {
                setPending(true);
                setTimeout(() => setPending(false), 1500);
              }}
            >
              {t("showcase.demo.clickToLoad")}
            </Button>
            <Button isDisabled>{t("showcase.demo.disabled")}</Button>
            <Button fullWidth variant="secondary" className="sm:max-w-xs">
              fullWidth
            </Button>
          </Row>
        </div>
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.linkButton")} code={`import { LinkButton } from "@/components/ui/link-button";\n\n<LinkButton href="/dashboard/customers" variant="secondary">Customers</LinkButton>`}>
          <Row>
            <LinkButton href="/dashboard/customers">{t("nav.customers")}</LinkButton>
            <LinkButton href="/dashboard/projects" variant="secondary">
              {t("nav.projects")}
            </LinkButton>
            <LinkButton href="/dashboard/settings" variant="ghost" isIconOnly aria-label={t("nav.settings")}>
              <Settings className="size-4" />
            </LinkButton>
          </Row>
        </Example>
        <Example title={t("showcase.ex.toggleGroup")} code={`<ToggleButtonGroup size="sm" selectionMode="single" disallowEmptySelection\n  selectedKeys={[align]} onSelectionChange={(k) => setAlign(String([...k][0]))}>\n  <ToggleButton id="start" isIconOnly aria-label="Start"><AlignLeft /></ToggleButton>\n  ...\n</ToggleButtonGroup>`}>
          <ToggleButtonGroup
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[align]}
            onSelectionChange={(k) => {
              const v = [...k][0];
              if (v) setAlign(String(v));
            }}
          >
            <ToggleButton id="start" isIconOnly aria-label={t("showcase.demo.alignStart")}>
              {isAr ? <AlignRight className="size-4" /> : <AlignLeft className="size-4" />}
            </ToggleButton>
            <ToggleButton id="center" isIconOnly aria-label={t("showcase.demo.alignCenter")}>
              <AlignCenter className="size-4" />
            </ToggleButton>
            <ToggleButton id="end" isIconOnly aria-label={t("showcase.demo.alignEnd")}>
              {isAr ? <AlignLeft className="size-4" /> : <AlignRight className="size-4" />}
            </ToggleButton>
          </ToggleButtonGroup>
        </Example>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.chips")} code={`<Chip size="sm" variant="soft" color="success">\n  <Chip.Label>Active</Chip.Label>\n</Chip>`}>
          <div className="flex flex-col gap-4">
            <Row label="soft">
              {CHIP_COLORS.map((c) => (
                <Chip key={c} size="sm" variant="soft" color={c}>
                  <Chip.Label>{c}</Chip.Label>
                </Chip>
              ))}
            </Row>
            <Row label="primary">
              {CHIP_COLORS.map((c) => (
                <Chip key={c} size="sm" variant="primary" color={c}>
                  <Chip.Label>{c}</Chip.Label>
                </Chip>
              ))}
            </Row>
          </div>
        </Example>
        <Example title={t("showcase.ex.badges")} code={`<Badge color="danger" size="sm"><Badge.Label>3</Badge.Label></Badge>`}>
          <div className="flex flex-col gap-4">
            <Row label="badge">
              <Badge color="danger" size="sm" className="static transform-none">
                <Badge.Label>3</Badge.Label>
              </Badge>
              <Badge color="warning" size="sm" className="static transform-none">
                <Badge.Label>12</Badge.Label>
              </Badge>
              <Badge color="success" size="sm" className="static transform-none">
                <Badge.Label>99+</Badge.Label>
              </Badge>
            </Row>
            <Row label="kbd">
              <Kbd>
                <Kbd.Abbr keyValue="command" />
                <Kbd.Content>K</Kbd.Content>
              </Kbd>
              <Kbd>
                <Kbd.Content>Esc</Kbd.Content>
              </Kbd>
            </Row>
          </div>
        </Example>
      </div>

      <Example title={t("showcase.ex.avatars")} code={`import { UserAvatar } from "@/components/ui/user-avatar";\n\n<UserAvatar name="Sara Al Balushi" size="sm" />   // initials + stable colour from the name\n<UserAvatar name={user.name} src={user.photo} size="lg" />`}>
        <Row>
          <UserAvatar name="Sara Al Balushi" size="sm" />
          <UserAvatar name="Omar Haddad" />
          <UserAvatar name="Layla Nasser" size="lg" />
          <UserAvatar name="خالد الراشدي" size="lg" />
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {["Ahmed", "Mona", "Yousef", "Huda"].map((n) => (
              <UserAvatar key={n} name={n} size="sm" className="ring-2 ring-app-surface" />
            ))}
          </div>
        </Row>
      </Example>

      <Example title={t("showcase.ex.menus")} code={`<Dropdown>\n  <Dropdown.Trigger className="...">Options</Dropdown.Trigger>\n  <Dropdown.Popover placement="bottom end">\n    <Dropdown.Menu aria-label="Options" onAction={(k) => ...}>\n      <Dropdown.Item id="edit" textValue="Edit"><Pencil /><Label>Edit</Label></Dropdown.Item>\n    </Dropdown.Menu>\n  </Dropdown.Popover>\n</Dropdown>`}>
        <Row>
          <Tooltip delay={300} closeDelay={0}>
            <Tooltip.Trigger
              render={(props) => (
                <Button {...(props as object)} variant="secondary">
                  {t("showcase.demo.hoverMe")}
                </Button>
              )}
            />
            <Tooltip.Content>{t("showcase.demo.tooltip")}</Tooltip.Content>
          </Tooltip>

          <Dropdown>
            <Dropdown.Trigger className="inline-flex h-10 items-center gap-1.5 rounded-full bg-neutral-500/10 px-4 text-sm font-medium transition hover:bg-neutral-500/15">
              <MoreHorizontal className="size-4" />
              {t("common.actions")}
              <ChevronDown className="size-3.5" />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom start">
              <Dropdown.Menu aria-label={t("common.actions")} onAction={(k) => console.info("action", k)}>
                <Dropdown.Item id="edit" textValue={t("common.edit")}>
                  <Pencil className="size-4" />
                  <Label>{t("common.edit")}</Label>
                </Dropdown.Item>
                <Dropdown.Item id="copy" textValue={t("showcase.demo.duplicate")}>
                  <Copy className="size-4" />
                  <Label>{t("showcase.demo.duplicate")}</Label>
                </Dropdown.Item>
                <Dropdown.Item id="download" textValue={t("showcase.demo.download")}>
                  <Download className="size-4" />
                  <Label>{t("showcase.demo.download")}</Label>
                </Dropdown.Item>
                <Dropdown.Item id="delete" textValue={t("common.delete")} variant="danger">
                  <Trash2 className="size-4" />
                  <Label>{t("common.delete")}</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <Popover>
            <Popover.Trigger className="inline-flex h-10 items-center gap-1.5 rounded-full bg-neutral-500/10 px-4 text-sm font-medium transition hover:bg-neutral-500/15">
              <Bell className="size-4" />
              {t("showcase.demo.popover")}
            </Popover.Trigger>
            <Popover.Content placement="bottom" className="w-72 rounded-2xl">
              <Popover.Dialog aria-label={t("showcase.demo.popover")} className="flex flex-col gap-2 p-4">
                <p className="flex items-center gap-2 font-semibold">
                  <Heart className="size-4 text-rose-500" />
                  {t("showcase.demo.popoverTitle")}
                </p>
                <p className="text-sm text-neutral-500">{t("showcase.demo.popoverBody")}</p>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </Row>
      </Example>
    </ShowcaseSection>
  );
}
