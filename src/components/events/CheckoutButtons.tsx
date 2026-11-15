"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { startCheckout } from "@/app/events/actions";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { TicketType } from "@/types/database";

export type CheckoutOption = {
  ticketType: TicketType;
  label: string;
  usd: number;
};

type Gateways = { stripe: boolean; paypal: boolean };

const gatewayLabels: { id: "stripe" | "paypal"; label: string }[] = [
  { id: "stripe", label: "استرایپ" },
  { id: "paypal", label: "پی‌پال" },
];

/**
 * Renders a USD purchase button per ticket type and per configured gateway.
 * On success the buyer is redirected to the hosted checkout; the server reads
 * the price from the database, so this component only sends an event id + type.
 */
export function CheckoutButtons({
  eventId,
  options,
  gateways,
}: {
  eventId: string;
  options: CheckoutOption[];
  gateways: Gateways;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const available = gatewayLabels.filter((gateway) => gateways[gateway.id]);

  async function handle(option: CheckoutOption, gateway: "stripe" | "paypal") {
    setBusy(`${option.ticketType}:${gateway}`);
    setError(null);

    const result = await startCheckout({ eventId, ticketType: option.ticketType, gateway });

    if (result.error === "auth-required") {
      router.push(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    if (!result.url) {
      setBusy(null);
      setError("پرداخت آغاز نشد. دوباره تلاش کنید.");
      return;
    }

    router.push(result.url);
  }

  return (
    <div className="mt-3 space-y-2">
      {options.map((option) => (
        <div
          key={option.ticketType}
          className="flex items-center justify-between gap-3 border-t border-line py-2.5 first:border-t-0 first:pt-0"
        >
          <div>
            <p className="text-sm font-medium text-navy-900">{option.label}</p>
            <p className="text-xs text-ink-muted">{formatPrice(option.usd, "USD")}</p>
          </div>

          <div className="flex gap-2">
            {available.map((gateway) => (
              <Button
                key={gateway.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => handle(option, gateway.id)}
              >
                {busy === `${option.ticketType}:${gateway.id}` ? "در حال اتصال…" : gateway.label}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {error ? (
        <p role="alert" className="text-xs leading-6 text-accent-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
