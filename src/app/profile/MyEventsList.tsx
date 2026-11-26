import Link from "next/link";

import { EventCover } from "@/components/events/EventCover";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CalendarIcon, MapPinIcon } from "@/components/ui/icons";
import { formatEventDate } from "@/lib/format";
import type { EventStatus } from "@/types/database";

export type MyEventRow = {
  eventId: string;
  title: string;
  status: EventStatus;
  eventDate: string;
  locationAddress: string | null;
  coverImageUrl: string | null;
  categoryName: string | null;
};

/**
 * Events the signed-in user is participating in (i.e. holds a verified ticket
 * for). Derived from the tickets table, so no separate read model is needed.
 */
export function MyEventsList({ events }: { events: MyEventRow[] }) {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-navy/8 text-navy">
          <CalendarIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-base font-bold text-navy">هنوز در رویدادی شرکت نکرده‌اید</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-7 text-ink-muted">
          پس از تأیید بلیت هر رویداد، همان رویداد در این بخش نمایش داده می‌شود و می‌توانید
          وارد اتاق گفتگوی آن شوید.
        </p>
        <ButtonLink href="/events" variant="outline" size="sm" className="mt-5">
          مشاهده رویدادها
        </ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
        <h2 className="text-sm font-bold text-navy">رویدادهای شما</h2>
        <span className="text-xs text-ink-muted">{events.length} رویداد</span>
      </div>

      <ul className="divide-y divide-line">
        {events.map((event) => (
          <li key={event.eventId} className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={`/events/${event.eventId}`}
                className="block w-full shrink-0 sm:w-44"
              >
                <EventCover
                  src={event.coverImageUrl}
                  className="rounded-xl"
                  sizes="(min-width: 640px) 176px, 100vw"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <EventStatusBadge status={event.status} />
                  {event.categoryName ? (
                    <Badge tone="gold">{event.categoryName}</Badge>
                  ) : null}
                </div>

                <h3 className="mt-2 text-base font-bold text-navy">
                  <Link
                    href={`/events/${event.eventId}`}
                    className="transition-colors hover:text-teal-strong"
                  >
                    {event.title}
                  </Link>
                </h3>

                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <CalendarIcon className="size-4 shrink-0" />
                  <time dateTime={event.eventDate}>{formatEventDate(event.eventDate)}</time>
                </p>

                {event.locationAddress ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                    <MapPinIcon className="size-4 shrink-0" />
                    {event.locationAddress}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ButtonLink href={`/events/${event.eventId}/chat`} variant="outline" size="sm">
                  اتاق گفتگو
                </ButtonLink>
                <ButtonLink href={`/events/${event.eventId}`} size="sm">
                  مشاهده رویداد
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
