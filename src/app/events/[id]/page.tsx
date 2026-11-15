import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventCover } from "@/components/events/EventCover";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { EventTabs } from "@/components/events/EventTabs";
import { EventTicketPanel } from "@/components/events/EventTicketPanel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CalendarIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth";
import { eventModes } from "@/lib/event-display";
import { isSupabaseConfigured } from "@/lib/env";
import { formatEventDate, formatEventTime } from "@/lib/format";
import {
  getEventAccess,
  getEventDetail,
  getMyEventTickets,
  isEventId,
  type EventAccessLinks,
} from "@/lib/events";
import { getServerClient } from "@/lib/supabase/server";
import { paypalConfig, stripeConfig } from "@/lib/server-env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isEventId(id)) return { title: "رویداد" };

  const event = await getEventDetail(id);
  if (!event) return { title: "رویداد" };

  const description = (event.description ?? "").slice(0, 160);

  return {
    title: event.title,
    description: description || undefined,
    openGraph: {
      title: event.title,
      description: description || undefined,
      ...(event.cover_image_url ? { images: [event.cover_image_url] } : {}),
    },
  };
}

function eventJsonLd(event: NonNullable<Awaited<ReturnType<typeof getEventDetail>>>) {
  const offers: Record<string, unknown>[] = [];
  const pushOffer = (name: string, irr: number | null, usd: number | null) => {
    if (irr !== null) offers.push({ "@type": "Offer", name, price: irr, priceCurrency: "IRR" });
    if (usd !== null) offers.push({ "@type": "Offer", name, price: usd, priceCurrency: "USD" });
  };

  if (event.status === "past") {
    pushOffer("ضبط رویداد", event.recording_price_irr, event.recording_price_usd);
  } else {
    pushOffer("حضوری", event.price_in_person_irr, event.price_in_person_usd);
    pushOffer("آنلاین", event.price_online_irr, event.price_online_usd);
  }

  const hasLocation = Boolean(event.location_address);
  const hasOnline = event.price_online_irr !== null || event.price_online_usd !== null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.event_date,
    description: event.description ?? undefined,
    ...(event.cover_image_url ? { image: [event.cover_image_url] } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: hasLocation
      ? hasOnline
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode"
      : "https://schema.org/OnlineEventAttendanceMode",
    ...(hasLocation
      ? { location: { "@type": "Place", name: event.location_address } }
      : { location: { "@type": "VirtualLocation", url: event.fidibo_url ?? undefined } }),
    ...(offers.length > 0 ? { offers } : {}),
  };
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string | string[] }>;
}) {
  const { id } = await params;
  if (!isEventId(id)) notFound();

  const sp = await searchParams;
  const checkoutParam = Array.isArray(sp.checkout) ? sp.checkout[0] : sp.checkout;
  const checkoutStatus = checkoutParam === "success" || checkoutParam === "cancelled" ? checkoutParam : null;

  if (!isSupabaseConfigured) {
    return (
      <section className="py-16">
        <Container>
          <Card className="mx-auto max-w-lg p-8 text-center">
            <h1 className="text-lg font-bold text-navy-900">رویداد در دسترس نیست</h1>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              اتصال به پایگاه داده برقرار نیست. چند لحظه بعد دوباره تلاش کنید.
            </p>
            <Link href="/events" className="mt-4 inline-flex text-sm font-medium text-navy-800 hover:underline">
              بازگشت به رویدادها
            </Link>
          </Card>
        </Container>
      </section>
    );
  }

  const supabase = await getServerClient();
  const user = await getSessionUser();

  const [event, tickets] = await Promise.all([
    getEventDetail(id),
    user && supabase ? getMyEventTickets(supabase, user.id, id) : Promise.resolve(null),
  ]);

  if (!event) notFound();

  const verified = (tickets ?? []).filter((ticket) => ticket.status === "verified");
  let access: EventAccessLinks | null = null;
  if (user && supabase && verified.length > 0) {
    access = await getEventAccess(supabase, id);
  }

  const modes = eventModes(event);
  const jsonLd = JSON.stringify(eventJsonLd(event)).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section className="bg-navy-900 text-white">
        <Container className="py-8 sm:py-10">
          <Link
            href="/events"
            className="inline-flex text-xs font-medium text-white/70 hover:text-white hover:underline"
          >
            بازگشت به رویدادها
          </Link>

          <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-center">
            <EventCover
              src={event.cover_image_url}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-2xl"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <EventStatusBadge status={event.status} />
                {event.categories ? <Badge tone="onDark">{event.categories.name}</Badge> : null}
              </div>

              <h1 className="mt-4 text-2xl font-bold leading-[1.4] sm:text-3xl">
                {event.title}
              </h1>

              <dl className="mt-5 space-y-3 text-sm text-white/85">
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">تاریخ</dt>
                  <CalendarIcon className="size-5 shrink-0 text-white/60" />
                  <dd>{formatEventDate(event.event_date)}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">ساعت</dt>
                  <ClockIcon className="size-5 shrink-0 text-white/60" />
                  <dd>{formatEventTime(event.event_date)}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">محل برگزاری</dt>
                  <MapPinIcon className="size-5 shrink-0 text-white/60" />
                  <dd>{event.location_address ?? "آنلاین"}</dd>
                </div>
              </dl>

              {modes.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {modes.map((mode) => (
                    <li key={mode}>
                      <Badge tone="onDark">{mode}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <EventTabs eventId={id} />

      {checkoutStatus ? (
        <div className="border-b border-line bg-canvas">
          <Container className="py-3">
            <p
              role="status"
              className="text-center text-xs leading-6 text-ink-muted"
            >
              {checkoutStatus === "cancelled"
                ? "پرداخت لغو شد یا تکمیل نشد. در صورت کسر وجه، به‌زودی بازگردانده می‌شود."
                : verified.length > 0
                  ? "پرداخت شما تأیید شد و بلیت صادر شد."
                  : "پرداخت شما در حال نهایی شدن است؛ چند لحظه بعد صفحه را تازه کنید."}
            </p>
          </Container>
        </div>
      ) : null}

      <section className="py-8 sm:py-10">
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_21rem]">
            <Card className="p-5 sm:p-6">
              <h2 className="text-base font-bold text-navy-900">درباره رویداد</h2>
              {event.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-ink">
                  {event.description}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-8 text-ink-muted">
                  توضیحی برای این رویداد ثبت نشده است.
                </p>
              )}
            </Card>

            <div className="space-y-4 lg:sticky lg:top-32">
              <EventTicketPanel
                event={event}
                tickets={tickets}
                access={access}
                isAuthenticated={Boolean(user)}
                gateways={{
                  stripe: stripeConfig.configured,
                  paypal: paypalConfig.configured,
                }}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
