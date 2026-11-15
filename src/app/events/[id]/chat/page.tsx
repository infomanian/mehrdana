import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventComingSoon } from "@/components/events/EventComingSoon";
import { EventSubHeader } from "@/components/events/EventSubHeader";
import { EventTabs } from "@/components/events/EventTabs";
import { Container } from "@/components/ui/Container";
import { ChatIcon } from "@/components/ui/icons";
import { isSupabaseConfigured } from "@/lib/env";
import { getEventShell, isEventId } from "@/lib/events";

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

  return (
    <>
      <EventSubHeader event={event} />
      <EventTabs eventId={id} />

      <section className="py-10 sm:py-14">
        <Container>
          <EventComingSoon
            icon={ChatIcon}
            title="اتاق گفتگو به‌زودی"
            body="اتاق گفتگوی زنده این رویداد قبل، حین و بعد از برگزاری در دسترس شرکت‌کنندگان قرار می‌گیرد. این بخش در مرحله بعد فعال می‌شود."
            note="ورود به اتاق گفتگو فقط برای دارندگان بلیت تأییدشده این رویداد ممکن خواهد بود."
          />
        </Container>
      </section>
    </>
  );
}
