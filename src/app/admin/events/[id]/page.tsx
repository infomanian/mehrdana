import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { requireAdmin } from "@/lib/admin";
import { toTehranDateTimeInput } from "@/lib/format";
import { getEventDetail, listCategories, listSpeakers } from "@/lib/events";
import { isUuid } from "@/lib/validation";

import { CoverUploader } from "../CoverUploader";
import { EventAccessForm } from "../EventAccessForm";
import { EventForm, type EventFormDefaults } from "../EventForm";

export const metadata: Metadata = {
  title: "ویرایش رویداد",
  robots: { index: false, follow: false },
};

function irrToToman(value: number | null): string {
  return value === null ? "" : String(Math.round(value / 10));
}

function usdValue(value: number | null): string {
  return value === null ? "" : String(value);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { supabase } = await requireAdmin(`/admin/events/${id}`);

  const [event, categories, speakers, accessResult] = await Promise.all([
    getEventDetail(id),
    listCategories(),
    listSpeakers(),
    supabase
      .from("event_access")
      .select("skyroom_link, recording_media_url")
      .eq("event_id", id)
      .maybeSingle(),
  ]);

  if (!event) notFound();
  if (accessResult.error) throw new Error("event-access-unavailable");

  const access = accessResult.data;
  const defaults: EventFormDefaults = {
    title: event.title,
    description: event.description ?? "",
    category_id: event.category_id ?? "",
    speaker_id: event.speaker_id ?? "",
    status: event.status,
    event_date: toTehranDateTimeInput(event.event_date),
    location_address: event.location_address ?? "",
    fidibo_url: event.fidibo_url ?? "",
    price_in_person_toman: irrToToman(event.price_in_person_irr),
    price_online_toman: irrToToman(event.price_online_irr),
    recording_price_toman: irrToToman(event.recording_price_irr),
    price_in_person_usd: usdValue(event.price_in_person_usd),
    price_online_usd: usdValue(event.price_online_usd),
    recording_price_usd: usdValue(event.recording_price_usd),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-navy-900">{event.title}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <Link
            href={`/events/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex text-sm font-medium text-navy-800 hover:underline"
          >
            مشاهده صفحه عمومی رویداد
          </Link>
        </div>
      </div>

      <EventForm
        mode="edit"
        eventId={id}
        defaults={defaults}
        categories={categories.map((category) => ({ id: category.id, label: category.name }))}
        speakers={speakers.map((speaker) => ({
          id: speaker.id,
          label: speaker.full_name ?? "سخنران",
        }))}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <CoverUploader eventId={id} coverUrl={event.cover_image_url} />
        <EventAccessForm
          eventId={id}
          skyroomLink={access?.skyroom_link ?? ""}
          recordingUrl={access?.recording_media_url ?? ""}
        />
      </div>
    </div>
  );
}
