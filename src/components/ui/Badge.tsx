import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "gold"
  | "teal"
  | "navy"
  | "accent"
  | "verified"
  | "onDark";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-canvas text-ink-muted border border-line",
  gold: "bg-gold/22 text-gold-strong",
  teal: "bg-teal/12 text-teal-strong",
  navy: "bg-navy/8 text-navy",
  accent: "bg-accent/10 text-accent-strong",
  verified: "bg-verified/12 text-verified-strong",
  onDark: "bg-white/15 text-white/85",
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
