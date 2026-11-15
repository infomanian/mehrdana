import { revalidatePath } from "next/cache";

import { capturePayPalOrder } from "@/lib/paypal";
import { issueGatewayTicket } from "@/lib/tickets";
import { isUuid } from "@/lib/validation";
import type { TicketType } from "@/types/database";

const TICKET_TYPES: TicketType[] = ["in_person", "online", "recording_only"];

type CustomId = {
  eventId?: string;
  ticketType?: TicketType;
  userId?: string;
};

/**
 * PayPal return URL (GET): captures the approved order and issues a verified
 * ticket. The order's `custom_id` carries the buyer metadata, so the buyer
 * cannot forge who or what the order was for.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("token");
  const eventId = url.searchParams.get("eventId") ?? "";

  const fallback = (status: "success" | "cancelled") =>
    Response.redirect(
      new URL(`/events/${eventId}?checkout=${status}`, request.url).toString(),
      303,
    );

  if (!orderId) return fallback("cancelled");

  const capture = await capturePayPalOrder(orderId);
  if (!capture.ok || !capture.unit) return fallback("cancelled");

  let custom: CustomId = {};
  try {
    custom = JSON.parse(capture.unit.customId ?? "{}") as CustomId;
  } catch {
    return fallback("cancelled");
  }

  const userId = custom.userId ?? "";
  const resolvedEventId = custom.eventId ?? eventId;
  const ticketType = custom.ticketType;
  const amountUsd = capture.unit.amountUsd;

  if (
    !isUuid(userId) ||
    !isUuid(resolvedEventId) ||
    !ticketType ||
    !TICKET_TYPES.includes(ticketType) ||
    amountUsd === null ||
    amountUsd <= 0
  ) {
    return fallback("cancelled");
  }

  const result = await issueGatewayTicket({
    userId,
    eventId: resolvedEventId,
    ticketType,
    gateway: "paypal",
    amountUsd,
    reference: orderId,
  });

  revalidatePath(`/events/${resolvedEventId}`);
  revalidatePath("/profile");
  revalidatePath("/admin/tickets");

  return result.ok ? fallback("success") : fallback("cancelled");
}
