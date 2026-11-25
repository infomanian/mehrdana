import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"div"> & {
  interactive?: boolean;
};

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        interactive &&
          "transition-all hover:-translate-y-0.5 hover:border-charcoal/20 hover:shadow-[0_10px_28px_rgba(31,25,19,0.08)]",
        className,
      )}
      {...props}
    />
  );
}
