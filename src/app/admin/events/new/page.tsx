import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin";
import { listCategories, listSpeakers } from "@/lib/events";

import { EventForm, type EventFormDefaults } from "../EventForm";

export const metadata: Metadata = {
  title: "رویداد جدید",
  robots: { index: false, follow: false },
};

const emptyDefaults: EventFormDefaults = {
  title: "",
  description: "",
  category_id: "",
  speaker_id: "",
  status: "upcoming",
  event_date: "",
  location_address: "",
  fidibo_url: "",
  price_in_person_toman: "",
  price_online_toman: "",
  recording_price_toman: "",
  price_in_person_usd: "",
  price_online_usd: "",
  recording_price_usd: "",
};

export default async function NewEventPage() {
  await requireAdmin("/admin/events/new");

  const [categories, speakers] = await Promise.all([listCategories(), listSpeakers()]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-navy-900">ساخت رویداد جدید</h1>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        پس از ساخت، تصویر کاور و لینک‌های اختصاصی را از صفحه ویرایش اضافه کنید.
      </p>

      <div className="mt-5">
        <EventForm
          mode="create"
          defaults={emptyDefaults}
          categories={categories.map((category) => ({
            id: category.id,
            label: category.name,
          }))}
          speakers={speakers.map((speaker) => ({
            id: speaker.id,
            label: speaker.full_name ?? "سخنران",
          }))}
        />
      </div>
    </div>
  );
}
