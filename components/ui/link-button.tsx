"use client";

import type { ReactNode } from "react";
import { buttonVariants } from "@heroui/styles";
import { Link, type LinkProps } from "react-aria-components";
import { cx } from "tailwind-variants";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "outline" | "danger" | "danger-soft";

export interface LinkButtonProps extends Omit<LinkProps, "className" | "children"> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isIconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * A HeroUI-styled button rendered as a real <a>. Navigates client-side through the
 * RouterProvider in app/providers.tsx (same as router.push) while keeping native
 * anchor behavior (hover URL, ctrl/middle-click, new tab). Use this instead of
 * wrapping <Button> in <Link>: react-aria's press handling stops click propagation,
 * so next/link never intercepts the click and the browser does a full reload.
 */
export function LinkButton({ variant, size, isIconOnly, fullWidth, className, children, ...rest }: LinkButtonProps) {
  const styles = buttonVariants({ variant, size, isIconOnly, fullWidth });
  return (
    <Link data-slot="button" {...rest} className={cx(styles, className)}>
      {children}
    </Link>
  );
}
