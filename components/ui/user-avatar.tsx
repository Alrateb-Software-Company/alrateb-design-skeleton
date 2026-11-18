"use client";

import { Avatar } from "@heroui/react";
import { UserRound } from "lucide-react";
import { englishInitials } from "@/lib/initials";

/** HeroUI Avatar with photo, else English initials, else a person icon (initials are never taken from Arabic). */
export function UserAvatar({
  name,
  initials,
  src,
  size = "md",
  color = "accent",
  className,
}: {
  /** The person's English name: initials come only from it (an Arabic-only name shows the icon). */
  name: string;
  /** Overrides the initials derived from `name` (must already be English). */
  initials?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  color?: "accent" | "danger" | "default" | "success" | "warning";
  className?: string;
}) {
  return (
    <Avatar size={size} color={color} variant="soft" className={className}>
      {src ? <Avatar.Image src={src} alt={name} /> : null}
      <Avatar.Fallback>{initials || englishInitials(name) || <UserRound className="size-1/2" />}</Avatar.Fallback>
    </Avatar>
  );
}
