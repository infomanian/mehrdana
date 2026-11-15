import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "navy" | "accent" | "verified" | "onDark";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-canvas text-ink-muted border border-line",
  navy: "bg-navy-800/8 text-navy-800",
  accent: "bg-accent/10 text-accent-strong",
  verified: "bg-verified/12 text-verified-strong",
  onDark: "bg-white/12 text-white/85",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium leading-6",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
