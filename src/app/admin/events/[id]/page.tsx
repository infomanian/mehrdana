import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Card } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { toTehranDateTimeInput } from "@/lib/format";
import { getEventDetail, listCategories, listSpeakers } from "@/lib/events";
import { ticketTypeLabels } from "@/lib/labels";
import { isUuid } from "@/lib/validation";

import { CoverUploader } from "../CoverUploader";
import { EventAccessForm } from "../EventAccessForm";
import { EventForm, type EventFormDefaults } from "../EventForm";
import { FidiboCodesForm } from "../FidiboCodesForm";

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

  const [event, categories, speakers, accessResult, codesResult] = await Promise.all([
    getEventDetail(id),
    listCategories(),
    listSpeakers(),
    supabase
      .from("event_access")
      .select("skyroom_link, recording_media_url")
      .eq("event_id", id)
      .maybeSingle(),
    supabase
      .from("valid_fidibo_codes")
      .select("id, code, ticket_type, is_used, used_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (!event) notFound();
  if (accessResult.error) throw new Error("event-access-unavailable");
  if (codesResult.error) throw new Error("fidibo-codes-unavailable");

  const access = accessResult.data;
  const codes = codesResult.data ?? [];
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
            <h1 className="truncate text-2xl font-bold text-charcoal">{event.title}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <Link
            href={`/events/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex text-sm font-medium text-charcoal hover:underline"
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

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <FidiboCodesForm eventId={id} />

        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-bold text-charcoal">کدهای ثبت‌شده ({codes.length})</h2>
          {codes.length === 0 ? (
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              هنوز کدی ثبت نشده است.
            </p>
          ) : (
            <ul className="mt-3 max-h-80 divide-y divide-line overflow-y-auto">
              {codes.map((code) => (
                <li key={code.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p dir="ltr" className="truncate text-start text-xs font-medium text-charcoal">
                      {code.code}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {ticketTypeLabels[code.ticket_type]}
                    </p>
                  </div>
                  <span
                    className={
                      code.is_used
                        ? "shrink-0 rounded-full bg-canvas px-2.5 py-0.5 text-[11px] text-ink-muted"
                        : "shrink-0 rounded-full bg-verified/12 px-2.5 py-0.5 text-[11px] font-medium text-verified-strong"
                    }
                  >
                    {code.is_used ? "استفاده‌شده" : "آزاد"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
