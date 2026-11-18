"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button, InputGroup, Label, Spinner, Surface, TextField } from "@heroui/react";
import { Building2, Globe, Mail, LogIn } from "lucide-react";
import { PasswordField } from "@/components/ui/password-field";
import { switchLocale, type AppLocale } from "@/lib/i18n";
import { signInDemo } from "@/lib/session";

/** Demo credentials shown on the form; any non-empty email/password signs in. */
const DEMO = { email: "demo@alrateb.com", password: "demo1234" };

export function LoginForm() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const otherLocale: AppLocale = i18n.language === "ar" ? "en" : "ar";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || pending) return;
    setPending(true);
    setError(null);
    // Replace with your real sign-in call; keep the pending/error UX.
    await new Promise((r) => setTimeout(r, 600));
    if (password.length < 4) {
      setError(t("auth.invalidCredentials"));
      setPending(false);
      return;
    }
    const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    signInDemo({ name: name || "Demo User", email, role: "admin" });
    const next = searchParams.get("callbackUrl");
    router.push(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <div className="relative w-full max-w-md">
      <div aria-hidden className="absolute -top-20 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-400/25 blur-3xl dark:bg-sky-500/15" />
      <Surface className="relative overflow-hidden rounded-3xl border border-black/5 p-8 shadow-2xl shadow-sky-950/10 dark:border-white/10 sm:p-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Building2 className="size-7" />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">{t("common.appName")}</p>
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.welcomeBack")}</h1>
          <p className="mt-1.5 text-sm text-neutral-500">{t("auth.signInSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField fullWidth isRequired variant="secondary" name="email" type="email" value={email} onChange={setEmail}>
            <Label>{t("auth.email")}</Label>
            <InputGroup>
              <InputGroup.Prefix className="text-neutral-400">
                <Mail className="size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input placeholder="you@company.com" autoComplete="email" />
            </InputGroup>
          </TextField>

          <PasswordField label={t("auth.password")} value={password} onChange={setPassword} error={error} autoComplete="current-password" />

          <Button type="submit" fullWidth size="lg" isPending={pending} className="mt-2">
            {pending ? <Spinner color="current" size="sm" /> : <LogIn className="size-4" />}
            {pending ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>

        <Button
          fullWidth
          variant="ghost"
          size="sm"
          className="mt-3 text-neutral-500"
          isDisabled={pending}
          onPress={() => {
            setEmail(DEMO.email);
            setPassword(DEMO.password);
          }}
        >
          {t("auth.useDemo")}
        </Button>

        <div className="mt-6 flex justify-center border-t border-app-border pt-5">
          <Button variant="ghost" size="sm" onPress={() => switchLocale(otherLocale)}>
            <Globe className="size-4" />
            {otherLocale === "ar" ? "العربية" : "English"}
          </Button>
        </div>
      </Surface>
    </div>
  );
}
