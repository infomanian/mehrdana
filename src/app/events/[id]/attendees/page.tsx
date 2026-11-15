import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventComingSoon } from "@/components/events/EventComingSoon";
import { EventSubHeader } from "@/components/events/EventSubHeader";
import { EventTabs } from "@/components/events/EventTabs";
import { Container } from "@/components/ui/Container";
import { UsersIcon } from "@/components/ui/icons";
import { isSupabaseConfigured } from "@/lib/env";
import { getEventShell, isEventId } from "@/lib/events";

export const metadata: Metadata = {
  title: "شرکت‌کنندگان",
  robots: { index: false, follow: false },
};

export default async function EventAttendeesPage({
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
            icon={UsersIcon}
            title="فهرست شرکت‌کنندگان به‌زودی"
            body="در این بخش می‌توانید شرکت‌کنندگان رویداد را ببینید، بر اساس علاقه‌مندی‌ها فیلتر کنید و با افراد هم‌مسیر ارتباط بگیرید. این بخش در مرحله بعد فعال می‌شود."
            note="فقط دارندگان بلیت تأییدشده این رویداد به فهرست شرکت‌کنندگان دسترسی خواهند داشت."
          />
        </Container>
      </section>
    </>
  );
}
