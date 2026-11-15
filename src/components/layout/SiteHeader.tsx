import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/icons";
import { headerNav, siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
          >
            <BrandMark className="size-9 shrink-0 text-navy-900" />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold text-navy-900">{siteConfig.name}</span>
              <span className="hidden text-[11px] font-normal text-ink-muted sm:inline">
                {siteConfig.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 md:flex">
            {headerNav.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas hover:text-navy-900"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.id}
                  aria-disabled="true"
                  title="به‌زودی"
                  className="cursor-default rounded-full px-3 py-2 text-sm font-medium text-ink-muted/60"
                >
                  {item.label}
                  <span className="sr-only"> (به‌زودی)</span>
                </span>
              ),
            )}
          </nav>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted">
          <span className="size-1.5 rounded-full bg-verified" aria-hidden="true" />
          ورود به‌زودی
        </span>
      </Container>
    </header>
  );
}
