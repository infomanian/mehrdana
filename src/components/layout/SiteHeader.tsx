import Link from "next/link";
import { Suspense } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth";
import { headerNav, siteConfig } from "@/lib/site";

import { UserMenu } from "./UserMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-cream/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <BrandMark className="size-8 shrink-0 text-navy" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg leading-none font-semibold text-navy">
                {siteConfig.name}
              </span>
              <span className="mt-1 hidden text-[10px] font-normal text-ink-muted sm:inline">
                {siteConfig.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="ناوبری اصلی" className="hidden items-center gap-6 md:flex">
            {headerNav.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm text-ink transition-colors hover:text-teal-strong"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.id}
                  aria-disabled="true"
                  title="به‌زودی"
                  className="cursor-default text-sm text-ink-muted/60"
                >
                  {item.label}
                  <span className="sr-only"> (به‌زودی)</span>
                </span>
              ),
            )}
          </nav>
        </div>

        <Suspense fallback={<HeaderAuthFallback />}>
          <HeaderAuth />
        </Suspense>
      </Container>
    </header>
  );
}

/**
 * Reads the verified session in its own component so the rest of the header
 * streams immediately and public pages are not blocked on auth.
 */
async function HeaderAuth() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <ButtonLink href="/login" size="sm">
        ورود / ثبت‌نام
      </ButtonLink>
    );
  }

  return <UserMenu email={user.email} />;
}

/** Same footprint as the final controls, so nothing jumps when auth resolves. */
function HeaderAuthFallback() {
  return <span aria-hidden="true" className="h-10 w-28 animate-pulse rounded-sm bg-navy/10" />;
}
