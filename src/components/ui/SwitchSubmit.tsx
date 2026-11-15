"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/cn";

/**
 * Presentational switch that submits its parent form. The real state lives in
 * the database; this component only reflects it and reports pending state.
 */
export function SwitchSubmit({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={pending}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
        checked ? "border-verified-strong bg-verified-strong" : "border-line bg-canvas",
        pending && "opacity-60",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-all",
          checked ? "end-0.5" : "start-0.5",
        )}
      />
    </button>
  );
}
