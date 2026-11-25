import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventChat } from "@/components/events/EventChat";
import { EventSubHeader } from "@/components/events/EventSubHeader";
import { EventTabs } from "@/components/events/EventTabs";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { LockIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth";
import { MESSAGE_PAGE_SIZE, type ChatMessage } from "@/lib/chat";
import { isSupabaseConfigured } from "@/lib/env";
import { getEventShell, isEventId } from "@/lib/events";
import { getServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "اتاق گفتگو",
  robots: { index: false, follow: false },
};

export default async function EventChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isEventId(id)) notFound();
  if (!isSupabaseConfigured) notFound();

  const event = await getEventShell(id);
  if (!event) notFound();

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
              <h2 className="mt-4 text-base font-bold text-charcoal">ورود به اتاق گفتگو</h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                اتاق گفتگو مخصوص دارندگان بلیت تأییدشده است. برای گفتگو ابتدا وارد حساب
                شوید.
              </p>
              <ButtonLink
                href={`/login?next=${encodeURIComponent(`/events/${id}/chat`)}`}
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

  const { data: hasAccess } = await supabase.rpc("has_event_access", {
    p_event_id: id,
  });

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
                برای ورود به اتاق گفتگو باید بلیت تأییدشده این رویداد را داشته باشید. پس از
                خرید و تأیید، این بخش برای شما باز می‌شود.
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

  const [messagesResult, profileResult, blocksResult] = await Promise.all([
    supabase.rpc("get_event_messages", {
      p_event_id: id,
      p_before: null,
      p_limit: MESSAGE_PAGE_SIZE,
    }),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
    supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id),
  ]);

  const messages = (messagesResult.data ?? []) as ChatMessage[];
  const profile = profileResult.data;
  const blockedIds = (blocksResult.data ?? []).map((block) => block.blocked_id);

  return (
    <>
      <EventSubHeader event={event} />
      <EventTabs eventId={id} />

      <section className="py-6 sm:py-8">
        <Container>
          <EventChat
            eventId={id}
            currentUserId={user.id}
            currentUserName={profile?.full_name ?? null}
            currentUserAvatar={profile?.avatar_url ?? null}
            initialMessages={messages}
            initialBlockedIds={blockedIds}
          />
        </Container>
      </section>
    </>
  );
}
