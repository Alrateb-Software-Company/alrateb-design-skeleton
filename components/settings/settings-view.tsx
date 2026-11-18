"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Label, TextArea, TextField, toast } from "@heroui/react";
import { Bell, Building2, Palette, Settings, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page";
import { FormFooter, FormGrid, FormGroupLabel, FormSection } from "@/components/ui/form-section";
import { AppSelect } from "@/components/ui/app-select";
import { AppSwitch } from "@/components/ui/app-switch";
import { AppColorField } from "@/components/ui/color-picker";
import { CountrySelect, CurrencySelect } from "@/components/ui/country-select";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { FileUpload } from "@/components/ui/file-upload";
import { FileCard } from "@/components/ui/file-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useSessionUser } from "@/components/layout/session-context";
import { APP_DEFAULTS } from "@/config/app";
import { switchLocale, type AppLocale } from "@/lib/i18n";

/** Reference settings page: stacked FormSections with one shared footer. */
export function SettingsView() {
  const { t, i18n } = useTranslation();
  const user = useSessionUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("Alrateb");
  const [country, setCountry] = useState<string>(APP_DEFAULTS.countryCode);
  const [currency, setCurrency] = useState<string>(APP_DEFAULTS.currency);
  const [timezone, setTimezone] = useState<string>(APP_DEFAULTS.timezone);
  const [brand, setBrand] = useState("#0f766e");
  const [logo, setLogo] = useState<{ path: string; name: string } | null>(null);
  const [notify, setNotify] = useState({ email: true, whatsapp: false, digest: true });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    toast.success(t("common.saved"));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} icon={<Settings className="size-5" />} />

      <div className="flex flex-col gap-6">
        <FormSection icon={<UserRound className="size-4" />} title={t("settings.profile.title")} hint={t("settings.profile.hint")}>
          <div className="flex items-center gap-4">
            <UserAvatar name={name || "?"} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{name || "—"}</p>
              <p className="truncate text-sm text-neutral-500" dir="ltr">
                {email}
              </p>
            </div>
          </div>
          <FormGrid>
            <TextField variant="secondary" value={name} onChange={setName}>
              <Label>{t("settings.profile.name")}</Label>
              <Input />
            </TextField>
            <TextField variant="secondary" type="email" value={email} onChange={setEmail}>
              <Label>{t("auth.email")}</Label>
              <Input dir="ltr" />
            </TextField>
            <PhoneInput label={t("customers.fields.phone")} value={phone} onChange={setPhone} />
            <AppSelect
              label={t("common.language")}
              value={i18n.language}
              onChange={(v) => switchLocale(v as AppLocale)}
              options={[
                { value: "en", label: "English" },
                { value: "ar", label: "العربية" },
              ]}
            />
          </FormGrid>
          <TextField variant="secondary" value={bio} onChange={setBio}>
            <Label>{t("settings.profile.bio")}</Label>
            <TextArea rows={3} placeholder={t("settings.profile.bioHint")} />
          </TextField>
        </FormSection>

        <FormSection icon={<Building2 className="size-4" />} title={t("settings.org.title")} hint={t("settings.org.hint")}>
          <FormGrid>
            <TextField variant="secondary" value={company} onChange={setCompany}>
              <Label>{t("settings.org.name")}</Label>
              <Input />
            </TextField>
            <CountrySelect label={t("settings.org.country")} value={country} onChange={setCountry} valueMode="code" />
            <CurrencySelect label={t("settings.org.currency")} value={currency} onChange={setCurrency} />
            <TimezoneSelect label={t("settings.org.timezone")} value={timezone} onChange={setTimezone} country={country} />
          </FormGrid>
        </FormSection>

        <FormSection icon={<Palette className="size-4" />} title={t("settings.branding.title")} hint={t("settings.branding.hint")}>
          <FormGrid>
            <AppColorField label={t("settings.branding.color")} value={brand} fallback="#0f766e" onChange={setBrand} />
            <div className="flex flex-col gap-2">
              <FormGroupLabel>{t("settings.branding.logo")}</FormGroupLabel>
              {logo ? (
                <FileCard path={logo.path} name={logo.name} onRemove={() => setLogo(null)} />
              ) : (
                <FileUpload folder="branding" accept="image/*" label={t("settings.branding.upload")} onUploaded={(path, fileName) => setLogo({ path, name: fileName })} />
              )}
            </div>
          </FormGrid>
          <div className="flex items-center gap-3 rounded-2xl p-4 text-white" style={{ backgroundColor: brand }}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 font-bold">{company.slice(0, 1) || "A"}</span>
            <div>
              <p className="font-semibold">{company}</p>
              <p className="text-xs text-white/80">{t("settings.branding.preview")}</p>
            </div>
          </div>
        </FormSection>

        <FormSection icon={<Bell className="size-4" />} title={t("settings.notify.title")} hint={t("settings.notify.hint")}>
          <div className="flex flex-col gap-3">
            {(["email", "whatsapp", "digest"] as const).map((k) => (
              <AppSwitch key={k} label={t(`settings.notify.${k}`)} description={t(`settings.notify.${k}Hint`)} isSelected={notify[k]} onChange={(v) => setNotify((n) => ({ ...n, [k]: v }))} />
            ))}
          </div>
        </FormSection>

        <FormFooter>
          <Button isPending={busy} onPress={save}>
            {t("common.save")}
          </Button>
        </FormFooter>
      </div>
    </div>
  );
}
