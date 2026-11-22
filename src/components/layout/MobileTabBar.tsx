"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { ChatIcon, HomeIcon, TicketIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { mobileTabNav } from "@/lib/site";

const iconById: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  events: HomeIcon,
  "my-events": TicketIcon,
  messages: ChatIcon,
  profile: UserIcon,
};

/**
 * Fixed bottom navigation for mobile / PWA.
 * Items whose route does not exist yet are rendered as muted, non-interactive
 * placeholders instead of dead links.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ناوبری موبایل"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {mobileTabNav.map((item) => {
          const Icon = iconById[item.id] ?? HomeIcon;

          if (!item.href) {
            return (
              <li key={item.id}>
                <span
                  aria-disabled="true"
                  className="flex min-h-14 cursor-default flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] text-ink-muted/50"
                >
                  <Icon className="size-5" />
                  {item.label}
                  <span className="sr-only"> (به‌زودی)</span>
                </span>
              </li>
            );
          }

          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-clay" : "text-ink-muted hover:text-charcoal",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
