"use client";

import { InputOTP } from "@heroui/react";

/** "2h" / "5m" / "30s" — compact resend-countdown label. */
export function formatWait(seconds: number, locale: string): string {
  const ar = locale === "ar";
  if (seconds >= 3600) return `${Math.ceil(seconds / 3600)}${ar ? " ساعة" : "h"}`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)}${ar ? " دقيقة" : "m"}`;
  return `${seconds}${ar ? " ثانية" : "s"}`;
}

/** House 6-digit OTP input (HeroUI InputOTP), always LTR. */
export function OtpInput({
  value,
  onChange,
  isDisabled,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div dir="ltr" className={className}>
      <InputOTP
        variant="secondary"
        maxLength={6}
        pattern="^\d+$"
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
        aria-label={ariaLabel}
      >
        <InputOTP.Group>
          {Array.from({ length: 6 }, (_, i) => (
            <InputOTP.Slot key={i} index={i} />
          ))}
        </InputOTP.Group>
      </InputOTP>
    </div>
  );
}
