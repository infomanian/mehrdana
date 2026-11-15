import "server-only";

import Stripe from "stripe";

import { siteUrl } from "@/lib/env";
import { stripeConfig } from "@/lib/server-env";
import type { TicketType } from "@/types/database";

export type CheckoutRequest = {
  eventId: string;
  eventTitle: string;
  ticketType: TicketType;
  userId: string;
  amountUsd: number;
};

export type CheckoutResult = { url: string } | { error: string };

/**
 * Creates a Stripe Checkout Session for a USD ticket. The amount always comes
 * from the database on the server (never from the client), and the success and
 * cancel URLs are built from the configured site URL.
 */
export async function createStripeCheckout(input: CheckoutRequest): Promise<CheckoutResult> {
  if (!stripeConfig.configured) return { error: "not-configured" };
  if (!Number.isFinite(input.amountUsd) || input.amountUsd <= 0) return { error: "invalid-amount" };

  const stripe = new Stripe(stripeConfig.secretKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(input.amountUsd * 100),
          product_data: { name: `بلیت ${input.eventTitle}` },
        },
      },
    ],
    metadata: {
      eventId: input.eventId,
      ticketType: input.ticketType,
      userId: input.userId,
    },
    success_url: `${siteUrl}/events/${input.eventId}?checkout=success`,
    cancel_url: `${siteUrl}/events/${input.eventId}`,
  });

  if (!session.url) return { error: "no-url" };
  return { url: session.url };
}

/** Verifies the webhook signature and returns the parsed event. */
export function constructStripeEvent(payload: string, signature: string): Stripe.Event {
  const stripe = new Stripe(stripeConfig.secretKey);
  return stripe.webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);
}
