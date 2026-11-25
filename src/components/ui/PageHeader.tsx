import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Container } from "./Container";
import { SectionLabel } from "./SectionLabel";

/**
 * Warm editorial header used at the top of every interior page, so the inner
 * pages match the homepage instead of the older navy hero blocks.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-rule bg-cream-deep", className)}>
      <Container className="py-12 sm:py-16">
        <SectionLabel>{eyebrow}</SectionLabel>

        <h1 className="mt-5 max-w-3xl font-display text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.25] font-medium text-navy">
          {title}
        </h1>

        {description ? (
          <p className="mt-5 max-w-2xl text-sm leading-8 text-ink-muted sm:text-base sm:leading-9">
            {description}
          </p>
        ) : null}

        {children}
      </Container>
    </section>
  );
}
