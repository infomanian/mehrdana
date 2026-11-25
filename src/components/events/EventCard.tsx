import Link from "next/link";

import { EventCover } from "@/components/events/EventCover";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CalendarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { eventModes, startingPrice } from "@/lib/event-display";
import { formatEventDate } from "@/lib/format";
import type { EventCardRow } from "@/lib/events";

export function EventCard({ event }: { event: EventCardRow }) {
  const modes = eventModes(event);
  const price = startingPrice(event);
  const speakerName = event.profiles?.full_name ?? "سخنران مهر دانا";

  return (
    <Card interactive className="h-full overflow-hidden">
      <Link href={`/events/${event.id}`} className="flex h-full flex-col">
        <EventCover src={event.cover_image_url} />

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            {event.categories ? (
              <Badge tone="gold">{event.categories.name}</Badge>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg leading-7 font-medium text-navy">
            {event.title}
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
            <CalendarIcon className="size-4 shrink-0" />
            <time dateTime={event.event_date}>{formatEventDate(event.event_date)}</time>
          </p>

          {modes.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {modes.map((mode) => (
                <li key={mode}>
                  <Badge className="px-2.5 py-0.5 text-[11px]">{mode}</Badge>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar
                src={event.profiles?.avatar_url}
                name={speakerName}
                className="size-8 shrink-0 text-xs"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-navy">{speakerName}</p>
                {event.profiles?.profession ? (
                  <p className="truncate text-[11px] text-ink-muted">
                    {event.profiles.profession}
                  </p>
                ) : null}
              </div>
            </div>

            <p
              className={cn(
                "shrink-0 whitespace-nowrap text-sm font-bold",
                price ? "text-navy" : "text-xs font-medium text-ink-muted",
              )}
            >
              {price ?? "قیمت به‌زودی"}
            </p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
