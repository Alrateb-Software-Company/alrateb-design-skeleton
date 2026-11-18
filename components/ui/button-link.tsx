"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants, type ButtonVariants } from "@heroui/react";

type ButtonLinkProps = ComponentProps<typeof NextLink> & ButtonVariants;

/** Next.js link styled exactly like a HeroUI Button. */
export function ButtonLink({
  className,
  variant,
  size,
  isIconOnly,
  fullWidth,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <NextLink
      {...props}
      className={buttonVariants({
        variant,
        size,
        isIconOnly,
        fullWidth,
        className: typeof className === "string" ? className : undefined,
      })}
    >
      {children}
    </NextLink>
  );
}
