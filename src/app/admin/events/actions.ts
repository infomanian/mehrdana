"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import {
  formUuid,
  isEventCoverPath,
  parseEventAccessForm,
  parseEventForm,
} from "@/lib/event-validation";

import type { EventActionState } from "./state";

function revalidateEvent(id?: string): void {
  revalidatePath("/events");
  revalidatePath("/admin/events");

  if (id) {
    revalidatePath(`/events/${id}`);
    revalidatePath(`/events/${id}/attendees`);
    revalidatePath(`/events/${id}/chat`);
    revalidatePath(`/admin/events/${id}`);
  }
}

const GENERIC_ERROR = "ذخیره تغییرات انجام نشد. چند لحظه بعد دوباره تلاش کنید.";

const TICKET_TYPES = ["in_person", "online", "recording_only"] as const;

export type FidiboCodesState = { ok?: boolean; message?: string };

/**
 * Bulk-adds Fidibo codes for an event. One code per line; codes are trimmed and
 * uppercased, duplicates are ignored. Only the codes table is touched.
 */
export async function addFidiboCodes(
  _previous: FidiboCodesState,
  formData: FormData,
): Promise<FidiboCodesState> {
  const eventId = formUuid(formData, "event_id");
  if (!eventId) return { message: "شناسه رویداد معتبر نیست." };

  const { supabase } = await requireAdmin(`/admin/events/${eventId}`);

  const ticketType = String(formData.get("ticket_type") ?? "");
  if (!TICKET_TYPES.includes(ticketType as (typeof TICKET_TYPES)[number])) {
    return { message: "نوع بلیت معتبر نیست." };
  }

  const codes = Array.from(
    new Set(
      String(formData.get("codes") ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim().toUpperCase())
        .filter((line) => line.length >= 4 && line.length <= 64),
    ),
  );

  if (codes.length === 0) {
    return { message: "حداقل یک کد معتبر (۴ تا ۶۴ نویسه) وارد کنید." };
  }

  const rows = codes.map((code) => ({
    event_id: eventId,
    code,
    ticket_type: ticketType as (typeof TICKET_TYPES)[number],
  }));

  const { error } = await supabase
    .from("valid_fidibo_codes")
    .upsert(rows, { onConflict: "event_id,code", ignoreDuplicates: true });

  if (error) return { message: GENERIC_ERROR };

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true, message: `${codes.length} کد ثبت شد. کدهای تکراری نادیده گرفته شد.` };
}

export async function createEvent(
  _previous: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const { supabase } = await requireAdmin("/admin/events/new");
  const { data, errors } = parseEventForm(formData);

  if (!data) {
    return { errors, message: "لطفاً موارد مشخص‌شده را اصلاح کنید." };
  }

  const { data: created, error } = await supabase
    .from("events")
    .insert(data)
    .select("id")
    .single();

  if (error || !created) {
    return {
      message:
        error?.code === "23503"
          ? "دسته‌بندی یا سخنران انتخاب‌شده دیگر وجود ندارد."
          : GENERIC_ERROR,
    };
  }

  revalidateEvent(created.id);
  redirect(`/admin/events/${created.id}`);
}

export async function updateEvent(
  _previous: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const id = formUuid(formData, "id");
  if (!id) return { message: "شناسه رویداد معتبر نیست." };

  const { supabase } = await requireAdmin(`/admin/events/${id}`);
  const { data, errors } = parseEventForm(formData);

  if (!data) {
    return { errors, message: "لطفاً موارد مشخص‌شده را اصلاح کنید." };
  }

  const { error } = await supabase.from("events").update(data).eq("id", id);

  if (error) {
    return {
      message:
        error.code === "23503"
          ? "دسته‌بندی یا سخنران انتخاب‌شده دیگر وجود ندارد."
          : GENERIC_ERROR,
    };
  }

  revalidateEvent(id);
  return { ok: true, message: "تغییرات رویداد ذخیره شد." };
}

export async function updateEventAccess(
  _previous: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const id = formUuid(formData, "id");
  if (!id) return { message: "شناسه رویداد معتبر نیست." };

  const { supabase } = await requireAdmin(`/admin/events/${id}`);
  const { data, errors } = parseEventAccessForm(formData);

  if (!data) {
    return { errors, message: "لطفاً موارد مشخص‌شده را اصلاح کنید." };
  }

  const { error } = await supabase
    .from("event_access")
    .upsert({ event_id: id, ...data }, { onConflict: "event_id" });

  if (error) return { message: GENERIC_ERROR };

  revalidateEvent(id);
  return { ok: true, message: "لینک‌های اختصاصی ذخیره شد." };
}

/**
 * Stores the public URL of a freshly uploaded cover. The browser uploads the
 * file straight to Storage; only the path is sent here, and it must be the
 * exact path the uploader writes inside this event's folder.
 */
export async function saveEventCover(
  eventId: string,
  path: string,
): Promise<{ ok: boolean; message?: string }> {
  const { supabase } = await requireAdmin(`/admin/events/${eventId}`);

  if (!isEventCoverPath(eventId, path)) {
    return { ok: false, message: "مسیر تصویر معتبر نیست." };
  }

  const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
  if (!data.publicUrl) return { ok: false, message: "آدرس تصویر ساخته نشد." };

  // A version suffix defeats the browser cache after re-uploading.
  const versioned = `${data.publicUrl}?v=${Date.now()}`;

  const { data: updated, error } = await supabase
    .from("events")
    .update({ cover_image_url: versioned })
    .eq("id", eventId)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return { ok: false, message: "ذخیره تصویر انجام نشد. دوباره تلاش کنید." };
  }

  revalidateEvent(eventId);
  return { ok: true };
}
