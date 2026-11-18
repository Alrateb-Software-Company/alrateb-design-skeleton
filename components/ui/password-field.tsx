"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { Eye, EyeOff, Lock } from "lucide-react";

/** Password input with a lock prefix and a show/hide visibility toggle. */
export function PasswordField({
  label,
  value,
  onChange,
  error,
  name = "password",
  autoComplete = "current-password",
  minLength,
  isRequired = true,
  placeholder = "••••••••",
  variant = "secondary",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  name?: string;
  autoComplete?: string;
  minLength?: number;
  isRequired?: boolean;
  placeholder?: string;
  variant?: "primary" | "secondary";
}) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <TextField
      fullWidth
      variant={variant}
      isRequired={isRequired}
      name={name}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      // "aria" keeps isInvalid from setting customValidity, which would block
      // re-submitting the form after a failed attempt.
      validationBehavior="aria"
    >
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Prefix className="text-neutral-400">
          <Lock className="size-4" />
        </InputGroup.Prefix>
        <InputGroup.Input
          className="min-w-0"
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={isRequired}
        />
        <InputGroup.Suffix className="pe-1.5">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
            className="flex size-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-neutral-300"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </InputGroup.Suffix>
      </InputGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
