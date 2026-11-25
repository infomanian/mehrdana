import Link from "next/link";

import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Container } from "@/components/ui/Container";
import type { EventShellRow } from "@/lib/events";

/** Compact header used by the tab sub-pages (attendees, chat). */
export function EventSubHeader({ event }: { event: EventShellRow }) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-5">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex text-xs font-medium text-charcoal hover:underline"
        >
          بازگشت به توضیحات رویداد
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-charcoal sm:text-2xl">{event.title}</h1>
          <EventStatusBadge status={event.status} />
        </div>
      </Container>
    </div>
  );
}
