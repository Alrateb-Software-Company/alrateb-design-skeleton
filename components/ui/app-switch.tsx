"use client";

import { Switch } from "@heroui/react";

/** HeroUI Switch with the label beside the control (the layout verified to render on surfaces). */
export function AppSwitch({ label, description, isSelected, onChange, isDisabled, className = "", size }: { label: React.ReactNode; description?: React.ReactNode; isSelected: boolean; onChange: (value: boolean) => void; isDisabled?: boolean; className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} isDisabled={isDisabled} className={className} size={size}>
      <Switch.Content className="flex items-center gap-3">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <span className="flex flex-col"><span className="text-sm">{label}</span>{description && <span className="text-xs text-neutral-500">{description}</span>}</span>
      </Switch.Content>
    </Switch>
  );
}
