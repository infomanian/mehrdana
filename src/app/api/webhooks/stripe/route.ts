import { revalidatePath } from "next/cache";

import { constructStripeEvent } from "@/lib/stripe";
import { issueGatewayTicket } from "@/lib/tickets";
import { isUuid } from "@/lib/validation";
import type { TicketType } from "@/types/database";

const TICKET_TYPES: TicketType[] = ["in_person", "online", "recording_only"];

/**
 * Stripe webhook. Verifies the signature, then issues a verified ticket for a
 * completed, paid checkout session. Repeated deliveries are harmless thanks to
 * the unique payment_reference index.
 */
export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await request.text();

  let event;
  try {
    event = constructStripeEvent(payload, signature);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as import("stripe").Stripe.Checkout.Session;
  if (session.payment_status !== "paid" || session.mode !== "payment") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const metadata = session.metadata ?? {};
  const userId = metadata.userId;
  const eventId = metadata.eventId;
  const ticketType = metadata.ticketType as TicketType;

  // Malformed metadata can never mint a ticket; acknowledge and stop.
  if (
    !isUuid(userId ?? "") ||
    !isUuid(eventId ?? "") ||
    !TICKET_TYPES.includes(ticketType)
  ) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const amountUsd = (session.amount_total ?? 0) / 100;
  const result = await issueGatewayTicket({
    userId,
    eventId,
    ticketType,
    gateway: "stripe",
    amountUsd,
    reference: session.id,
  });

  if (!result.ok) return new Response("Ticket creation failed", { status: 500 });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/profile");
  revalidatePath("/admin/tickets");

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
