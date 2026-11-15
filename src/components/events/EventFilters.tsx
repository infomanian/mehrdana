import Link from "next/link";

import { cn } from "@/lib/cn";
import type { CategoryOption } from "@/lib/events";

type ListStatus = "upcoming" | "past";

function buildHref(status: ListStatus, category?: string): string {
  const params = new URLSearchParams();
  if (status === "past") params.set("status", "past");
  if (category) params.set("category", category);

  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

export function EventFilters({
  activeStatus,
  activeCategory,
  categories,
}: {
  activeStatus: ListStatus;
  activeCategory?: string;
  categories: CategoryOption[];
}) {
  const statusTabs: { value: ListStatus; label: string }[] = [
    { value: "upcoming", label: "رویدادهای پیشرو" },
    { value: "past", label: "برگزارشده‌ها" },
  ];

  return (
    <div className="space-y-4">
      <nav aria-label="فیلتر وضعیت رویداد">
        <ul className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
          {statusTabs.map((tab) => {
            const isActive = tab.value === activeStatus;
            return (
              <li key={tab.value} className="flex-1 sm:flex-none">
                <Link
                  href={buildHref(tab.value, activeCategory)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-navy-800 text-white"
                      : "text-ink-muted hover:bg-canvas hover:text-navy-900",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="فیلتر دسته‌بندی رویداد">
        <ul className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={buildHref(activeStatus)}
              aria-current={!activeCategory ? "page" : undefined}
              className={cn(
                "inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                !activeCategory
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-line bg-surface text-ink-muted hover:border-navy-800/25 hover:text-navy-900",
              )}
            >
              همه دسته‌ها
            </Link>
          </li>

          {categories.map((category) => {
            const isActive = category.slug === activeCategory;
            return (
              <li key={category.slug}>
                <Link
                  href={buildHref(activeStatus, category.slug)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-verified-strong bg-verified/12 text-verified-strong"
                      : "border-line bg-surface text-ink-muted hover:border-navy-800/25 hover:text-navy-900",
                  )}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
