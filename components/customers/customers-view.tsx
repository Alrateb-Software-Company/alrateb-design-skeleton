"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button, Chip, Input, Label, SearchField, TextField, toast } from "@heroui/react";
import { Crown, Mail, Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPresets } from "@/components/ui/filter-presets";
import { SortSelect } from "@/components/ui/sort-select";
import { ColumnSettingsButton } from "@/components/ui/column-settings-button";
import { DataTable } from "@/components/ui/data-table";
import { ListPagination } from "@/components/ui/list-pagination";
import { ConfirmDialog, Modal, useModalSessionKey } from "@/components/ui/modal";
import { FormFooter, FormGrid } from "@/components/ui/form-section";
import { AppSelect } from "@/components/ui/app-select";
import { AppSwitch } from "@/components/ui/app-switch";
import { PhoneInput } from "@/components/ui/phone-input";
import { Money } from "@/components/ui/money";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useListFilters } from "@/hooks/useListFilters";
import { useTableColumns, type TableColumnDef } from "@/hooks/useTableColumns";
import { APP_DEFAULTS } from "@/config/app";
import { CITIES, CUSTOMERS, localName, type Customer, type CustomerStatus } from "@/lib/demo-data";
import { fmtDate } from "@/lib/format";

const PAGE_SIZE = 8;
const STATUS_COLOR: Record<CustomerStatus, "success" | "accent" | "default"> = { active: "success", lead: "accent", inactive: "default" };
const FILTER_DEFAULTS = { q: "", status: "", city: "", sort: "name", page: 1 };
const SORTS = [
  { value: "name", labelKey: "customers.sort.name" },
  { value: "newest", labelKey: "customers.sort.newest" },
  { value: "balance", labelKey: "customers.sort.balance" },
];
const STATUSES: CustomerStatus[] = ["active", "lead", "inactive"];

/**
 * Reference list page: header → filter bar → table (cards on narrow screens) → pagination,
 * with an add/edit modal, delete confirmation, bulk selection and toasts.
 */
export function CustomersView() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const searchParams = useSearchParams();
  // Local copy stands in for the API; every mutation below is where a fetch would go.
  const [rows, setRows] = useState<Customer[]>(CUSTOMERS);
  const [editing, setEditing] = useState<Customer | "new" | null>(searchParams.get("new") ? "new" : null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const filters = useListFilters("customers", FILTER_DEFAULTS);
  const f = filters.values;

  const defs: TableColumnDef[] = useMemo(
    () => [
      { key: "name", label: t("customers.fields.name"), isRowHeader: true, cardTitle: true, locked: true },
      { key: "contact", label: t("customers.fields.contact"), cardSubtitle: true },
      { key: "city", label: t("customers.fields.city") },
      { key: "joined", label: t("customers.fields.joined"), defaultHidden: true },
      { key: "balance", label: t("customers.fields.balance") },
      { key: "status", label: t("common.status"), cardTrailing: true },
      { key: "act", label: "", text: t("common.actions"), className: "w-px text-end", hideInCard: true, locked: true },
    ],
    [t]
  );
  const table = useTableColumns("customers", defs);

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const list = rows.filter(
      (c) =>
        (!f.status || c.status === f.status) &&
        (!f.city || c.city === f.city) &&
        (!q || [c.name, c.nameAr, c.email, c.phone].some((v) => v.toLowerCase().includes(q)))
    );
    return list.sort((a, b) =>
      f.sort === "newest" ? b.joined.localeCompare(a.joined) : f.sort === "balance" ? b.balance - a.balance : localName(a, lang).localeCompare(localName(b, lang), lang)
    );
  }, [rows, f.q, f.status, f.city, f.sort, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(f.page, totalPages);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const statusOptions = STATUSES.map((s) => ({ value: s, label: t(`customers.status.${s}`) }));
  const cityOptions = CITIES.map((c) => ({ value: c, label: t(`customers.cities.${c}`) }));
  const icon = <Users className="size-6" />;

  const save = (c: Customer) => {
    setRows((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list]));
    setEditing(null);
    toast.success(t("common.saved"));
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    setRows((list) => list.filter((x) => x.id !== deleting.id));
    setDeleting(null);
    setBusy(false);
    toast.success(t("common.deleted"));
  };

  const removeSelected = () => {
    setRows((list) => list.filter((x) => !selected.has(x.id)));
    toast.success(t("customers.bulkDeleted", { count: selected.size }));
    setSelected(new Set());
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle", { count: rows.length })}
        icon={<Users className="size-5" />}
        action={{ label: t("customers.add"), icon: <Plus className="size-4" />, onPress: () => setEditing("new") }}
      />

      <div className="flex flex-col gap-4">
        <FilterBar
          filters={filters}
          resultCount={filtered.length}
          search={
            <SearchField aria-label={t("common.search")} value={f.q} onChange={(v) => filters.set("q", v)} className="w-64">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder={t("customers.search")} />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          }
          tools={
            <>
              <FilterPresets filters={filters} />
              <ColumnSettingsButton table={table} size="md" />
            </>
          }
        >
          <FilterSelect ariaLabel={t("common.status")} allLabel={t("customers.allStatuses")} value={f.status} onChange={(v) => filters.set("status", v)} options={statusOptions} className="w-44" />
          <FilterSelect ariaLabel={t("customers.fields.city")} allLabel={t("customers.allCities")} value={f.city} onChange={(v) => filters.set("city", v)} options={cityOptions} className="w-44" />
          <SortSelect value={f.sort} options={SORTS} onChange={(v) => filters.set("sort", v)} />
        </FilterBar>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-sky-500/10 px-4 py-2 text-sm">
            <span className="font-medium text-sky-700 dark:text-sky-300">{t("common.selectedCount", { count: selected.size })}</span>
            <Button size="sm" variant="ghost" className="ms-auto" onPress={() => setSelected(new Set())}>
              {t("common.clearSelection")}
            </Button>
            <Button size="sm" variant="danger-soft" onPress={removeSelected}>
              <Trash2 className="size-4" />
              {t("common.delete")}
            </Button>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState icon={icon} title={t("customers.empty")} hint={t("customers.emptyHint")} action={{ label: t("customers.add"), onPress: () => setEditing("new") }} />
        ) : (
          <DataTable<number>
            framed
            ariaLabel={t("customers.title")}
            columns={table.columns}
            selection={{ selected, onChange: setSelected, labelOf: (id) => rows.find((r) => r.id === id)?.name ?? String(id) }}
            emptyState={<EmptyState icon={icon} title={t("common.noMatches")} hint={t("common.noMatchesHint")} action={{ label: t("filters.clearAll"), onPress: filters.reset }} />}
            footer={totalPages > 1 ? <ListPagination page={page} totalPages={totalPages} onChange={(p) => filters.set("page", p)} /> : undefined}
            rows={pageRows.map((c) => ({
              key: c.id,
              cells: {
                name: (
                  <span className="flex items-center gap-3">
                    <UserAvatar name={c.name} size="sm" />
                    <span className="flex min-w-0 items-center gap-1.5 font-medium">
                      <span className="truncate">{localName(c, lang)}</span>
                      {c.vip && <Crown className="size-3.5 shrink-0 text-violet-500" aria-label={t("customers.vip")} />}
                    </span>
                  </span>
                ),
                contact: (
                  <span className="flex flex-col text-xs text-neutral-500">
                    <span className="flex items-center gap-1" dir="ltr">
                      <Mail className="size-3" />
                      {c.email}
                    </span>
                    <span dir="ltr" className="text-start">
                      {c.phone}
                    </span>
                  </span>
                ),
                city: t(`customers.cities.${c.city}`),
                joined: fmtDate(c.joined, lang),
                balance: <Money amount={c.balance} currency={APP_DEFAULTS.currency} className={`tabular-nums ${c.balance < 0 ? "text-red-600 dark:text-red-400" : ""}`} />,
                status: (
                  <Chip size="sm" variant="soft" color={STATUS_COLOR[c.status]}>
                    <Chip.Label>{t(`customers.status.${c.status}`)}</Chip.Label>
                  </Chip>
                ),
                act: (
                  <span className="flex justify-end gap-1">
                    <Button size="sm" isIconOnly variant="ghost" aria-label={t("common.edit")} onPress={() => setEditing(c)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="sm" isIconOnly variant="ghost" aria-label={t("common.delete")} onPress={() => setDeleting(c)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </span>
                ),
              },
              cardFooter: (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onPress={() => setEditing(c)}>
                    <Pencil className="size-4" />
                    {t("common.edit")}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onPress={() => setDeleting(c)}>
                    <Trash2 className="size-4" />
                    {t("common.delete")}
                  </Button>
                </div>
              ),
            }))}
          />
        )}
      </div>

      <CustomerModal entry={editing} onClose={() => setEditing(null)} onSaved={save} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("customers.deleteTitle")}
        message={t("customers.deleteHint", { name: deleting ? localName(deleting, lang) : "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        pending={busy}
        onConfirm={remove}
      />
    </div>
  );
}

function CustomerModal({ entry, onClose, onSaved }: { entry: Customer | "new" | null; onClose: () => void; onSaved: (c: Customer) => void }) {
  const { t } = useTranslation();
  // New key per opening: the form's state resets while the modal stays mounted for its exit animation.
  const key = useModalSessionKey(!!entry);
  return (
    <Modal open={!!entry} onClose={onClose} title={t(entry === "new" ? "customers.add" : "customers.edit")} wide>
      {entry && <CustomerForm key={key} entry={entry === "new" ? null : entry} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function CustomerForm({ entry, onClose, onSaved }: { entry: Customer | null; onClose: () => void; onSaved: (c: Customer) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState(entry?.name ?? "");
  const [nameAr, setNameAr] = useState(entry?.nameAr ?? "");
  const [email, setEmail] = useState(entry?.email ?? "");
  const [phone, setPhone] = useState(entry?.phone ?? "");
  const [city, setCity] = useState<string>(entry?.city ?? "muscat");
  const [status, setStatus] = useState<string>(entry?.status ?? "lead");
  const [vip, setVip] = useState(entry?.vip ?? false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2 || !/.+@.+\..+/.test(email)) {
      setError(t("customers.formInvalid"));
      return;
    }
    setError(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    onSaved({
      id: entry?.id ?? Date.now(),
      name: name.trim(),
      nameAr: nameAr.trim(),
      email: email.trim(),
      phone,
      city,
      status: status as CustomerStatus,
      vip,
      balance: entry?.balance ?? 0,
      joined: entry?.joined ?? new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <FormGrid>
        <TextField variant="secondary" isRequired value={name} onChange={setName}>
          <Label>{t("customers.fields.nameEn")}</Label>
          <Input maxLength={120} dir="ltr" />
        </TextField>
        <TextField variant="secondary" value={nameAr} onChange={setNameAr}>
          <Label>{t("customers.fields.nameAr")}</Label>
          <Input maxLength={120} dir="rtl" />
        </TextField>
        <TextField variant="secondary" isRequired type="email" value={email} onChange={setEmail}>
          <Label>{t("customers.fields.email")}</Label>
          <Input dir="ltr" placeholder="name@company.com" />
        </TextField>
        <PhoneInput label={t("customers.fields.phone")} value={phone} onChange={setPhone} />
        <AppSelect label={t("customers.fields.city")} value={city} onChange={setCity} options={CITIES.map((c) => ({ value: c, label: t(`customers.cities.${c}`) }))} />
        <AppSelect label={t("common.status")} value={status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: t(`customers.status.${s}`) }))} />
      </FormGrid>
      <AppSwitch label={t("customers.vip")} description={t("customers.vipHint")} isSelected={vip} onChange={setVip} />
      <FormFooter error={error}>
        <Button variant="tertiary" onPress={onClose}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" isPending={busy}>
          {t("common.save")}
        </Button>
      </FormFooter>
    </form>
  );
}
