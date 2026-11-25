import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AttendeeCard } from "@/components/events/AttendeeCard";
import { EventSubHeader } from "@/components/events/EventSubHeader";
import { EventTabs } from "@/components/events/EventTabs";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { LockIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getEventShell, isEventId } from "@/lib/events";
import type { Attendee, ConnectionState } from "@/lib/networking";
import { getServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";
import type { ConnectionStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "شرکت‌کنندگان",
  robots: { index: false, follow: false },
};

type ConnectionRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
};

function buildHref(id: string, interest: string | undefined, common: boolean): string {
  const params = new URLSearchParams();
  if (common) params.set("common", "1");
  if (interest) params.set("interest", interest);
  const query = params.toString();
  return query ? `/events/${id}/attendees?${query}` : `/events/${id}/attendees`;
}

export default async function EventAttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ interest?: string | string[]; common?: string | string[] }>;
}) {
  const { id } = await params;
  if (!isEventId(id)) notFound();
  if (!isSupabaseConfigured) notFound();

  const event = await getEventShell(id);
  if (!event) notFound();

  const sp = await searchParams;
  const interestParam = Array.isArray(sp.interest) ? sp.interest[0] : sp.interest;
  const interest = interestParam?.trim() || undefined;
  const common = sp.common === "1";

  const user = await getSessionUser();

  if (!user) {
    return (
      <>
        <EventSubHeader event={event} />
        <EventTabs eventId={id} />
        <section className="py-12 sm:py-16">
          <Container>
            <Card className="mx-auto max-w-md p-8 text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-charcoal/8 text-charcoal">
                <LockIcon className="size-6" />
              </span>
              <h2 className="mt-4 text-base font-bold text-charcoal">ورود به فهرست شرکت‌کنندگان</h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                فهرست شرکت‌کنندگان مخصوص دارندگان بلیت تأییدشده است. برای دیدن آن ابتدا وارد
                حساب شوید.
              </p>
              <ButtonLink
                href={`/login?next=${encodeURIComponent(`/events/${id}/attendees`)}`}
                className="mt-5"
              >
                ورود به حساب
              </ButtonLink>
            </Card>
          </Container>
        </section>
      </>
    );
  }

  const supabase = await getServerClient();
  if (!supabase) notFound();

  const { data: hasAccess } = await supabase.rpc("has_event_access", { p_event_id: id });

  if (!hasAccess) {
    return (
      <>
        <EventSubHeader event={event} />
        <EventTabs eventId={id} />
        <section className="py-12 sm:py-16">
          <Container>
            <Card className="mx-auto max-w-md p-8 text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-charcoal/8 text-charcoal">
                <LockIcon className="size-6" />
              </span>
              <h2 className="mt-4 text-base font-bold text-charcoal">نیاز به بلیت تأییدشده</h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                برای دیدن شرکت‌کنندگان و شبکه‌سازی باید بلیت تأییدشده این رویداد را داشته
                باشید.
              </p>
              <ButtonLink href={`/events/${id}`} variant="outline" className="mt-5">
                خرید بلیت
              </ButtonLink>
            </Card>
          </Container>
        </section>
      </>
    );
  }

  const [attendeesResult, profileResult, connectionsResult] = await Promise.all([
    supabase.rpc("get_event_attendees", {
      p_event_id: id,
      p_interest: interest ?? null,
      p_common: common,
    }),
    supabase.from("profiles").select("interests").eq("id", user.id).maybeSingle(),
    supabase
      .from("connections")
      .select("id, requester_id, receiver_id, status")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  const attendees = (attendeesResult.data ?? []) as Attendee[];
  const myInterests = profileResult.data?.interests ?? [];
  const connections = (connectionsResult.data ?? []) as unknown as ConnectionRow[];

  const stateMap = new Map<string, ConnectionState>();
  for (const connection of connections) {
    const otherId =
      connection.requester_id === user.id ? connection.receiver_id : connection.requester_id;

    if (connection.status === "accepted") {
      stateMap.set(otherId, { kind: "friends", connectionId: connection.id });
    } else if (connection.status === "pending") {
      if (connection.requester_id === user.id) {
        stateMap.set(otherId, { kind: "pending_sent" });
      } else {
        stateMap.set(otherId, { kind: "pending_received", connectionId: connection.id });
      }
    }
  }

  return (
    <>
      <EventSubHeader event={event} />
      <EventTabs eventId={id} />

      <section className="py-6 sm:py-8">
        <Container>
          <nav aria-label="فیلتر علاقه‌مندی" className="flex flex-wrap items-center gap-2">
            <Link
              href={buildHref(id, undefined, false)}
              aria-current={!interest && !common ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                !interest && !common
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-line bg-surface text-ink-muted hover:text-charcoal",
              )}
            >
              همه
            </Link>

            <Link
              href={buildHref(id, undefined, true)}
              aria-current={common ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                common
                  ? "border-verified-strong bg-verified/12 text-verified-strong"
                  : "border-line bg-surface text-ink-muted hover:text-charcoal",
              )}
            >
              علایق مشترک با من
            </Link>

            {myInterests.map((tag) => (
              <Link
                key={tag}
                href={buildHref(id, tag, false)}
                aria-current={interest === tag ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  interest === tag
                    ? "border-verified-strong bg-verified/12 text-verified-strong"
                    : "border-line bg-surface text-ink-muted hover:text-charcoal",
                )}
              >
                {tag}
              </Link>
            ))}
          </nav>

          {attendees.length === 0 ? (
            <Card className="mt-6 p-10 text-center">
              <h2 className="text-base font-bold text-charcoal">شرکت‌کننده‌ای یافت نشد</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-muted">
                {interest || common
                  ? "با این فیلتر، شرکت‌کننده‌ای پیدا نشد."
                  : "هنوز شرکت‌کننده‌ای با پروفایل عمومی در این رویداد ثبت نشده است."}
              </p>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attendees.map((attendee) => (
                <AttendeeCard
                  key={attendee.id}
                  attendee={attendee}
                  state={stateMap.get(attendee.id) ?? { kind: "none" }}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
