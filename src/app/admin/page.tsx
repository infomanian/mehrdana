import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "داشبورد",
  robots: { index: false, follow: false },
};

const quickLinks = [
  { href: "/admin/events", label: "رویدادها" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/tickets", label: "بلیت‌ها" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/reports", label: "گزارش‌ها" },
];

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin("/admin");

  const [events, pendingTickets, openReports, users] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "رویدادها", value: events.count ?? 0, href: "/admin/events" },
    { label: "بلیت‌های در انتظار", value: pendingTickets.count ?? 0, href: "/admin/tickets" },
    { label: "گزارش‌های باز", value: openReports.count ?? 0, href: "/admin/reports" },
    { label: "کاربران", value: users.count ?? 0, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">داشبورد مدیریت</h1>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        نمای کلی و دسترسی سریع به بخش‌های مدیریت.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card interactive className="p-5">
              <p className="text-3xl font-bold text-navy">{stat.value}</p>
              <p className="mt-1 text-base text-ink-muted">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-bold text-navy">دسترسی سریع</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-line bg-surface px-4 py-2 text-base font-medium text-navy transition-colors hover:border-navy/25 hover:bg-canvas"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
