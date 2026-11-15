import "server-only";

import { siteUrl } from "@/lib/env";
import { paypalConfig } from "@/lib/server-env";
import type { TicketType } from "@/types/database";

export type PayPalCheckoutRequest = {
  eventId: string;
  eventTitle: string;
  ticketType: TicketType;
  userId: string;
  amountUsd: number;
};

export type CheckoutResult = { url: string } | { error: string };

type TokenResponse = { access_token: string };
type OrderResponse = { links?: { rel: string; href: string }[] };
type CaptureResponse = {
  purchase_units?: { custom_id?: string; amount?: { value?: string } }[];
};

async function accessToken(): Promise<string> {
  const auth = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`,
  ).toString("base64");

  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) throw new Error("paypal-token");
  const json = (await response.json()) as TokenResponse;
  return json.access_token;
}

/** Creates a PayPal order and returns the approval URL the buyer is sent to. */
export async function createPayPalOrder(input: PayPalCheckoutRequest): Promise<CheckoutResult> {
  if (!paypalConfig.configured) return { error: "not-configured" };
  if (!Number.isFinite(input.amountUsd) || input.amountUsd <= 0) return { error: "invalid-amount" };

  const token = await accessToken();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: input.eventId,
        custom_id: JSON.stringify({
          eventId: input.eventId,
          ticketType: input.ticketType,
          userId: input.userId,
        }),
        description: `بلیت ${input.eventTitle}`,
        amount: { currency_code: "USD", value: input.amountUsd.toFixed(2) },
      },
    ],
    application_context: {
      brand_name: "مهر دانا",
      user_action: "PAY_NOW",
      return_url: `${siteUrl}/api/paypal/capture?eventId=${input.eventId}`,
      cancel_url: `${siteUrl}/events/${input.eventId}?checkout=cancelled`,
    },
  };

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) return { error: "create-failed" };

  const json = (await response.json()) as OrderResponse;
  const approveUrl = json.links?.find((link) => link.rel === "approve")?.href;
  if (!approveUrl) return { error: "no-approve-url" };

  return { url: approveUrl };
}

export type CapturedUnit = {
  customId: string | null;
  amountUsd: number | null;
};

/** Captures an approved order and returns its metadata + amount. */
export async function capturePayPalOrder(
  orderId: string,
): Promise<{ ok: boolean; unit?: CapturedUnit }> {
  const token = await accessToken();

  const response = await fetch(
    `${paypalConfig.baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );

  if (!response.ok) return { ok: false };

  const json = (await response.json()) as CaptureResponse;
  const purchaseUnit = json.purchase_units?.[0];
  const amount = purchaseUnit?.amount?.value ? Number(purchaseUnit.amount.value) : null;

  return {
    ok: true,
    unit: { customId: purchaseUnit?.custom_id ?? null, amountUsd: amount },
  };
}
