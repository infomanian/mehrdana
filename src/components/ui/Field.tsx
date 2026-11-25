import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Shared input shell. Kept free of font-size so callers can pick their own
 * without fighting two competing Tailwind classes.
 */
export const fieldBase =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-muted/60 outline-none transition-colors focus:border-navy/40 focus:ring-2 focus:ring-navy/10 disabled:cursor-not-allowed disabled:bg-canvas";

export const inputStyles = cn(fieldBase, "text-sm");

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-accent-strong">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-6 text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Builds the aria-describedby value for a field that may show hint or error. */
export function describedBy(id: string, hint: string | undefined, error: string | undefined) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
