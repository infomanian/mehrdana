import type { Metadata } from "next";
import Link from "next/link";

import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CalendarIcon } from "@/components/ui/icons";
import { formatEventDate } from "@/lib/format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "رویدادها",
  robots: { index: false, follow: false },
};

type AdminEventRow = {
  id: string;
  title: string;
  status: "upcoming" | "live" | "past";
  event_date: string;
  location_address: string | null;
  categories: { name: string } | null;
};

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin("/admin/events");

  const { data, error } = await supabase
    .from("events")
    .select("id, title, status, event_date, location_address, categories(name)")
    .order("event_date", { ascending: false })
    .limit(100);

  if (error) throw new Error("admin-events-unavailable");

  const events = (data ?? []) as unknown as AdminEventRow[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">مدیریت رویدادها</h1>
          <p className="mt-1 text-sm leading-7 text-ink-muted">
            ساخت و ویرایش رویدادها، قیمت‌ها، کاور و لینک‌های اختصاصی.
          </p>
        </div>

        <ButtonLink href="/admin/events/new">ساخت رویداد جدید</ButtonLink>
      </div>

      {events.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <h2 className="text-base font-bold text-navy-900">هنوز رویدادی ساخته نشده است</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-muted">
            اولین رویداد را بسازید تا در ویترین سایت نمایش داده شود. کاور و لینک‌های
            اختصاصی را بعداً از صفحه ویرایش اضافه کنید.
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="mt-6 hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-canvas text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-3 text-start font-medium">
                    رویداد
                  </th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">
                    وضعیت
                  </th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">
                    دسته‌بندی
                  </th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">
                    تاریخ
                  </th>
                  <th scope="col" className="px-5 py-3 text-start font-medium">
                    <span className="sr-only">اقدام</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-line align-middle">
                    <td className="px-5 py-3 font-medium text-navy-900">{event.title}</td>
                    <td className="px-3 py-3">
                      <EventStatusBadge status={event.status} />
                    </td>
                    <td className="px-3 py-3 text-xs text-ink">
                      {event.categories?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-muted">
                      {formatEventDate(event.event_date)}
                    </td>
                    <td className="px-5 py-3 text-end">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-xs font-medium text-navy-800 hover:underline"
                      >
                        ویرایش
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <ul className="mt-6 space-y-3 md:hidden">
            {events.map((event) => (
              <li key={event.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-navy-900">{event.title}</p>
                    <EventStatusBadge status={event.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon className="size-4" />
                      {formatEventDate(event.event_date)}
                    </span>
                    {event.categories ? <Badge>{event.categories.name}</Badge> : null}
                  </div>

                  <Link
                    href={`/admin/events/${event.id}`}
                    className="mt-3 inline-flex text-sm font-medium text-navy-800 hover:underline"
                  >
                    ویرایش رویداد
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
