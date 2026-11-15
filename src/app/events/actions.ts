"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser, requireSession } from "@/lib/auth";
import { createPayPalOrder } from "@/lib/paypal";
import { createStripeCheckout } from "@/lib/stripe";
import { getServerClient } from "@/lib/supabase/server";
import { formUuid } from "@/lib/event-validation";
import { isUuid } from "@/lib/validation";
import type { TicketType } from "@/types/database";

import type { FidiboCodeState } from "./state";

type CheckoutPayload = {
  eventId: string;
  ticketType: TicketType;
  gateway: "stripe" | "paypal";
};

type EventPriceRow = {
  title: string;
  status: "upcoming" | "live" | "past";
  price_in_person_usd: number | null;
  price_online_usd: number | null;
  recording_price_usd: number | null;
};

function usdPriceFor(event: EventPriceRow, ticketType: TicketType): number | null {
  if (ticketType === "in_person") return event.price_in_person_usd;
  if (ticketType === "online") return event.price_online_usd;
  return event.recording_price_usd;
}

export async function verifyFidiboCodeAction(
  _previous: FidiboCodeState,
  formData: FormData,
): Promise<FidiboCodeState> {
  const eventId = formUuid(formData, "event_id");
  if (!eventId) return { message: "شناسه رویداد معتبر نیست." };

  const { supabase } = await requireSession(`/events/${eventId}`);

  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { message: "کد بلیت را وارد کنید." };
  if (code.length < 4) return { message: "کد واردشده کوتاه است." };

  const { data, error } = await supabase.rpc("verify_fidibo_code", {
    p_event_id: eventId,
    p_code: code,
  });

  if (error) return { message: "بررسی کد انجام نشد. دوباره تلاش کنید." };

  const status = data?.[0]?.status;
  if (status === "verified") {
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/profile");
    return { ok: true, message: "بلیت شما تأیید شد و دسترسی رویداد باز شد." };
  }

  if (status === "rate_limited") {
    return { message: "تلاش‌های زیادی انجام دادید. کمی صبر کنید و دوباره تلاش کنید." };
  }

  return { message: "کد واردشده معتبر نیست یا قبلاً استفاده شده است." };
}

/**
 * Starts a USD checkout. Prices are re-read from the database on the server, so
 * a tampered amount can never reach Stripe or PayPal.
 */
export async function startCheckout(
  payload: CheckoutPayload,
): Promise<{ url?: string; error?: string }> {
  if (!isUuid(payload.eventId)) return { error: "invalid-event" };

  const supabase = await getServerClient();
  const user = await getSessionUser();
  if (!supabase || !user) return { error: "auth-required" };

  const { data: event, error } = await supabase
    .from("events")
    .select("title, status, price_in_person_usd, price_online_usd, recording_price_usd")
    .eq("id", payload.eventId)
    .maybeSingle();

  if (error || !event) return { error: "not-found" };

  const row = event as EventPriceRow;
  const isPast = row.status === "past";

  if (isPast ? payload.ticketType !== "recording_only" : payload.ticketType === "recording_only") {
    return { error: "invalid-type" };
  }

  const amountUsd = usdPriceFor(row, payload.ticketType);
  if (amountUsd === null || amountUsd <= 0) return { error: "no-price" };

  const request = {
    eventId: payload.eventId,
    eventTitle: row.title,
    ticketType: payload.ticketType,
    userId: user.id,
    amountUsd,
  };

  if (payload.gateway === "stripe") return createStripeCheckout(request);
  return createPayPalOrder(request);
}
