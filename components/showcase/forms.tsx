"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Checkbox, Description, Input, Label, NumberField, Radio, RadioGroup, SearchField, Slider, TextArea, TextField } from "@heroui/react";
import { Building, Briefcase, Store } from "lucide-react";
import { AppSelect, AppMultiSelect, AppMultiAutocomplete } from "@/components/ui/app-select";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppDatePicker, AppDateTimePicker, AppTimePicker } from "@/components/ui/app-date-picker";
import { AppDateRangePicker, type DateRangeValue } from "@/components/ui/app-date-range-picker";
import { AppSwitch } from "@/components/ui/app-switch";
import { PasswordField } from "@/components/ui/password-field";
import { PhoneInput } from "@/components/ui/phone-input";
import { OtpInput } from "@/components/ui/otp-input";
import { CountrySelect, CurrencySelect } from "@/components/ui/country-select";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { RemotePicker, type RemoteOption } from "@/components/ui/remote-picker";
import { CreatableMultiPicker, CreatableSinglePicker } from "@/components/ui/creatable-picker";
import { AppColorField, InlineSwatchPicker } from "@/components/ui/color-picker";
import { RecurrenceField, DEFAULT_RECURRENCE } from "@/components/ui/recurrence-field";
import { AvailabilityEditor } from "@/components/ui/availability-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { FileCard } from "@/components/ui/file-card";
import { AiFilePicker, type AiFilePayload } from "@/components/ui/ai-file-picker";
import { FormGrid } from "@/components/ui/form-section";
import { DEFAULT_STAFF_HOURS, type Availability } from "@/config/availability";
import type { Recurrence } from "@/lib/recurrence";
import { CUSTOMERS, localName } from "@/lib/demo-data";
import { Example, ShowcaseSection } from "./showcase-kit";

// CodeMirror is heavy: load it only when the example renders.
const CodeEditor = dynamic(() => import("@/components/ui/code-editor"), { ssr: false });

const SWATCHES = ["#0f766e", "#c29a4b", "#6366f1", "#10b981", "#f43f5e", "#f59e0b"];

export function FormsSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const customerOptions = CUSTOMERS.map((c) => ({ value: String(c.id), label: localName(c, lang), description: c.email, searchText: `${c.name} ${c.nameAr}` }));
  const typeOptions = [
    { value: "office", label: t("showcase.demo.office"), icon: <Building className="size-4" /> },
    { value: "retail", label: t("showcase.demo.retail"), icon: <Store className="size-4" /> },
    { value: "business", label: t("showcase.demo.business"), icon: <Briefcase className="size-4" /> },
  ];

  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(3);
  const [pw, setPw] = useState("");
  const [phone, setPhone] = useState("");
  const [q, setQ] = useState("");
  const [otp, setOtp] = useState("");

  const [single, setSingle] = useState("office");
  const [auto, setAuto] = useState("");
  const [multi, setMulti] = useState<string[]>(["office"]);
  const [multiAuto, setMultiAuto] = useState<string[]>([]);
  const [country, setCountry] = useState("OM");
  const [currency, setCurrency] = useState("OMR");
  const [tz, setTz] = useState("Asia/Muscat");
  const [remote, setRemote] = useState("");
  const [remoteSel, setRemoteSel] = useState<RemoteOption | null>(null);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>(["vip"]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [dateTime, setDateTime] = useState("");
  const [range, setRange] = useState<DateRangeValue>({ from: "", to: "" });

  const [sw, setSw] = useState(true);
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState("monthly");
  const [volume, setVolume] = useState(40);

  const [color, setColor] = useState("#0f766e");
  const [swatch, setSwatch] = useState(SWATCHES[1]);
  const [recurrence, setRecurrence] = useState<Recurrence>(DEFAULT_RECURRENCE);
  const [hours, setHours] = useState<Availability>(DEFAULT_STAFF_HOURS);
  const [code, setCode] = useState('{\n  "name": "Alrateb",\n  "theme": "teal"\n}');
  const [files, setFiles] = useState<{ path: string; name: string }[]>([]);
  const [aiFile, setAiFile] = useState<AiFilePayload | null>(null);

  // Stand-in for a server search endpoint: RemotePicker debounces and calls this.
  const searchCustomers = async (query: string): Promise<RemoteOption[]> => {
    await new Promise((r) => setTimeout(r, 250));
    const s = query.toLowerCase();
    return CUSTOMERS.filter((c) => !s || c.name.toLowerCase().includes(s) || c.nameAr.includes(query)).map((c) => ({ value: String(c.id), label: localName(c, lang), description: c.email, en: c.name }));
  };

  return (
    <ShowcaseSection id="forms" title={t("showcase.sections.forms")} hint={t("showcase.hints.forms")}>
      <Example
        title={t("showcase.ex.textInputs")}
        code={`<TextField variant="secondary" isRequired value={name} onChange={setName}>
  <Label>Name</Label>
  <Input maxLength={120} />
  <Description>Shown on invoices</Description>
</TextField>
<PasswordField label="Password" value={pw} onChange={setPw} />
<PhoneInput label="Phone" value={phone} onChange={setPhone} />`}
      >
        <FormGrid>
          <TextField variant="secondary" isRequired value={text} onChange={setText}>
            <Label>{t("showcase.demo.fullName")}</Label>
            <Input placeholder={t("showcase.demo.fullNameHint")} maxLength={120} />
            <Description>{t("showcase.demo.fieldDescription")}</Description>
          </TextField>
          <TextField variant="secondary" type="email" isInvalid defaultValue="not-an-email">
            <Label>{t("auth.email")}</Label>
            <Input dir="ltr" />
            <Description className="text-red-600">{t("showcase.demo.invalidEmail")}</Description>
          </TextField>
          <PasswordField label={t("auth.password")} value={pw} onChange={setPw} autoComplete="new-password" />
          <PhoneInput label={t("customers.fields.phone")} value={phone} onChange={setPhone} />
          <NumberField variant="secondary" value={qty} minValue={0} maxValue={99} onChange={(v) => setQty(Number.isFinite(v) ? v : 0)}>
            <Label>{t("showcase.demo.quantity")}</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
          <SearchField variant="secondary" aria-label={t("common.search")} value={q} onChange={setQ}>
            <Label>{t("common.search")}</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t("common.search")} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <TextField variant="secondary" value={notes} onChange={setNotes} className="sm:col-span-2">
            <Label>{t("showcase.demo.notes")}</Label>
            <TextArea rows={3} placeholder={t("showcase.demo.notesHint")} />
          </TextField>
          <div className="flex flex-col gap-2">
            <Label>{t("showcase.demo.otp")}</Label>
            <OtpInput value={otp} onChange={setOtp} ariaLabel={t("showcase.demo.otp")} />
          </div>
        </FormGrid>
      </Example>

      <Example
        title={t("showcase.ex.selects")}
        code={`<AppSelect label="Type" value={type} onChange={setType}
  options={[{ value: "office", label: "Office", icon: <Building className="size-4" /> }]} />
<AppAutocomplete label="Customer" value={id} onChange={setId} options={opts} clearable />
<RemotePicker label="Customer" value={id} selected={sel} onChange={(v, o) => ...}
  search={(q) => fetch(\`/api/customers?q=\${q}\`).then((r) => r.json())} />`}
      >
        <FormGrid>
          <AppSelect label="AppSelect" value={single} onChange={setSingle} options={typeOptions} />
          <AppAutocomplete label="AppAutocomplete" value={auto} onChange={setAuto} options={customerOptions} clearable placeholder={t("showcase.demo.pickCustomer")} />
          <AppMultiSelect label="AppMultiSelect" value={multi} onChange={setMulti} options={typeOptions} />
          <AppMultiAutocomplete label="AppMultiAutocomplete" value={multiAuto} onChange={setMultiAuto} options={customerOptions} placeholder={t("showcase.demo.pickCustomer")} />
          <RemotePicker
            label="RemotePicker"
            value={remote}
            selected={remoteSel}
            onChange={(v, o) => {
              setRemote(v);
              setRemoteSel(o);
            }}
            search={searchCustomers}
          />
          <CreatableSinglePicker label="CreatableSinglePicker" value={tag} onChange={setTag} options={["design", "urgent", "maintenance"].map((v) => ({ value: v, label: v }))} />
          <CreatableMultiPicker label="CreatableMultiPicker" value={tags} onChange={setTags} options={["vip", "new", "wholesale"].map((v) => ({ value: v, label: v }))} />
          <CountrySelect label="CountrySelect" value={country} onChange={setCountry} valueMode="code" />
          <CurrencySelect label="CurrencySelect" value={currency} onChange={setCurrency} />
          <TimezoneSelect label="TimezoneSelect" value={tz} onChange={setTz} country={country} />
        </FormGrid>
      </Example>

      <Example title={t("showcase.ex.dates")} code={`// Values are plain strings: "YYYY-MM-DD", "HH:mm", "YYYY-MM-DDTHH:mm"\n<AppDatePicker label="Due" value={due} onChange={setDue} isClearable />\n<AppDateRangePicker label="Period" value={{ from, to }} onChange={setRange} />`}>
        <FormGrid>
          <AppDatePicker label="AppDatePicker" value={date} onChange={setDate} isClearable />
          <AppTimePicker label="AppTimePicker" value={time} onChange={setTime} />
          <AppDateTimePicker label="AppDateTimePicker" value={dateTime} onChange={setDateTime} />
          <AppDateRangePicker label="AppDateRangePicker" value={range} onChange={setRange} isClearable />
        </FormGrid>
      </Example>

      <Example title={t("showcase.ex.toggles")} code={`<AppSwitch label="Email alerts" description="Daily summary" isSelected={on} onChange={setOn} />\n<Checkbox isSelected={agree} onChange={setAgree}>...</Checkbox>\n<RadioGroup value={plan} onChange={setPlan}>...</RadioGroup>`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <AppSwitch label={t("showcase.demo.switchLabel")} description={t("showcase.demo.switchHint")} isSelected={sw} onChange={setSw} />
            <Checkbox variant="secondary" isSelected={agree} onChange={setAgree}>
              <Checkbox.Content className="flex items-center gap-2">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <span className="text-sm">{t("showcase.demo.agree")}</span>
              </Checkbox.Content>
            </Checkbox>
            <Slider value={volume} onChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)} className="max-w-xs">
              <div className="flex justify-between text-sm">
                <Label>{t("showcase.demo.volume")}</Label>
                <Slider.Output />
              </div>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </div>
          <RadioGroup value={plan} onChange={setPlan} aria-label={t("showcase.demo.plan")} className="flex flex-col gap-2">
            <Label>{t("showcase.demo.plan")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {["monthly", "quarterly", "yearly"].map((o) => (
                <Radio
                  key={o}
                  value={o}
                  className="cursor-pointer rounded-lg border border-app-border px-3 py-1.5 text-sm data-[selected=true]:border-sky-500 data-[selected=true]:bg-sky-500/10 data-[selected=true]:text-sky-700 dark:data-[selected=true]:text-sky-300"
                >
                  <Radio.Content>{t(`showcase.demo.${o}`)}</Radio.Content>
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.colors")} code={`<AppColorField label="Brand" value={c} fallback="#0f766e" onChange={setC} />\n<InlineSwatchPicker label="Tag" value={c} colors={SWATCHES} onChange={setC} />`}>
          <div className="flex flex-col gap-4">
            <AppColorField label="AppColorField" value={color} fallback="#0f766e" onChange={setColor} />
            <InlineSwatchPicker label="InlineSwatchPicker" value={swatch} colors={SWATCHES} onChange={setSwatch} />
          </div>
        </Example>
        <Example title={t("showcase.ex.recurrence")} code={`<RecurrenceField value={rule} onChange={setRule} />`}>
          <RecurrenceField value={recurrence} onChange={setRecurrence} />
        </Example>
      </div>

      <Example title={t("showcase.ex.availability")} code={`<AvailabilityEditor value={hours} onChange={setHours} />`}>
        <AvailabilityEditor value={hours} onChange={setHours} />
      </Example>

      <div className="grid gap-4 lg:grid-cols-2">
        <Example title={t("showcase.ex.files")} code={`<FileUpload folder="docs" label="Upload" multiple onUploaded={(path, name) => add({ path, name })} />\n<FileCard path={f.path} name={f.name} onRemove={() => remove(f)} />`}>
          <div className="flex flex-col gap-3">
            <FileUpload folder="showcase" label={t("showcase.demo.upload")} multiple onUploaded={(path, name) => setFiles((l) => [...l, { path, name }])} />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <FileCard key={f.path} path={f.path} name={f.name} onRemove={() => setFiles((l) => l.filter((x) => x.path !== f.path))} />
                ))}
              </div>
            )}
          </div>
        </Example>
        <Example title={t("showcase.ex.aiFile")} code={`<AiFilePicker file={file} onChange={setFile} />   // base64 payload for AI extraction`}>
          <AiFilePicker file={aiFile} onChange={setAiFile} />
        </Example>
      </div>

      <Example title={t("showcase.ex.code")} code={`const CodeEditor = dynamic(() => import("@/components/ui/code-editor"), { ssr: false });\n<CodeEditor value={json} onChange={setJson} height="16rem" />`}>
        <CodeEditor value={code} onChange={setCode} height="10rem" ariaLabel="JSON" />
      </Example>
    </ShowcaseSection>
  );
}
