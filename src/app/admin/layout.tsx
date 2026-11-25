import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin/events");

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3">
            <Badge tone="navy">مدیریت</Badge>
            <nav aria-label="بخش‌های مدیریت">
              <Link
                href="/admin"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-canvas"
              >
                داشبورد
              </Link>
              <Link
                href="/admin/events"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-canvas"
              >
                رویدادها
              </Link>
              <Link
                href="/admin/categories"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-canvas"
              >
                دسته‌بندی‌ها
              </Link>
              <Link
                href="/admin/tickets"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-canvas"
              >
                بلیت‌ها
              </Link>
              <Link
                href="/admin/users"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-canvas"
              >
                کاربران
              </Link>
              <Link
                href="/admin/reports"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-canvas"
              >
                گزارش‌ها
              </Link>
            </nav>
          </div>

          <Link
            href="/"
            className="text-xs font-medium text-ink-muted hover:text-ink hover:underline"
          >
            مشاهده سایت
          </Link>
        </Container>
      </div>

      <div className="py-8 sm:py-10">
        <Container>{children}</Container>
      </div>
    </>
  );
}
