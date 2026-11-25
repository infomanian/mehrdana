"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChatIcon, InfoIcon, UsersIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Route-based tabs: every tab has a real, shareable URL, so the browser back
 * button, bookmarks and the future chat page all behave correctly.
 */
export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/events/${eventId}`;

  const tabs = [
    { href: base, label: "توضیحات رویداد", icon: InfoIcon },
    { href: `${base}/attendees`, label: "شرکت‌کنندگان", icon: UsersIcon },
    { href: `${base}/chat`, label: "اتاق گفتگو", icon: ChatIcon },
  ];

  return (
    <nav
      aria-label="بخش‌های رویداد"
      className="sticky top-16 z-30 border-y border-line bg-surface/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-1 overflow-x-auto py-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive = href === base ? pathname === base : pathname.startsWith(href);

            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-navy text-cream"
                      : "text-ink-muted hover:bg-canvas hover:text-navy",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
