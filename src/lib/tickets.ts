import "server-only";

import { getServiceClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/validation";
import type { TicketType } from "@/types/database";

export type GatewayTicketInput = {
  userId: string;
  eventId: string;
  ticketType: TicketType;
  gateway: "stripe" | "paypal";
  amountUsd: number;
  reference: string;
};

const TICKET_TYPES: TicketType[] = ["in_person", "online", "recording_only"];

/**
 * Creates a VERIFIED international-payment ticket via the service role.
 * Called only by the signature-verified Stripe webhook and the PayPal capture
 * callback. Idempotent: the unique `payment_reference` index turns a repeated
 * delivery into a no-op instead of a second ticket.
 */
export async function issueGatewayTicket(
  input: GatewayTicketInput,
): Promise<{ ok: boolean; created: boolean }> {
  if (!isUuid(input.userId) || !isUuid(input.eventId)) return { ok: false, created: false };
  if (!TICKET_TYPES.includes(input.ticketType)) return { ok: false, created: false };
  if (!Number.isFinite(input.amountUsd) || input.amountUsd < 0) {
    return { ok: false, created: false };
  }

  const supabase = getServiceClient();
  if (!supabase) return { ok: false, created: false };

  const { error } = await supabase.from("tickets").insert({
    user_id: input.userId,
    event_id: input.eventId,
    ticket_type: input.ticketType,
    payment_gateway: input.gateway,
    currency: "USD",
    amount_paid: input.amountUsd,
    payment_reference: input.reference,
    status: "verified",
  });

  if (error) {
    // 23505 = duplicate payment reference: already processed, treat as success.
    return { ok: error.code === "23505", created: false };
  }

  return { ok: true, created: true };
}
