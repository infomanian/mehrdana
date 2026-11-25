import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Section eyebrow: a hairline plus a small editorial label.
 * Shared by the homepage sections and the interior page headers.
 */
export function SectionLabel({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-medium",
        tone === "light" ? "text-cream/60" : "text-ink-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-px w-8", tone === "light" ? "bg-cream/35" : "bg-charcoal/35")}
      />
      {children}
    </p>
  );
}
