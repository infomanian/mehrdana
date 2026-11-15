import { formatPrice } from "@/lib/format";
import type { EventStatus } from "@/types/database";

type EventPriceFields = {
  status: EventStatus;
  price_in_person_irr: number | null;
  price_online_irr: number | null;
  price_in_person_usd: number | null;
  price_online_usd: number | null;
  recording_price_irr: number | null;
  recording_price_usd: number | null;
  location_address: string | null;
};

/** Delivery modes inferred from the public price fields and the venue. */
export function eventModes(event: EventPriceFields): string[] {
  const modes: string[] = [];

  if (
    event.location_address ||
    event.price_in_person_irr !== null ||
    event.price_in_person_usd !== null
  ) {
    modes.push("حضوری");
  }
  if (event.price_online_irr !== null || event.price_online_usd !== null) {
    modes.push("آنلاین");
  }
  if (event.recording_price_irr !== null || event.recording_price_usd !== null) {
    modes.push("ضبط رویداد");
  }

  return modes;
}

/**
 * Cheapest relevant price for a card. Persian readers think in Toman, so IRR
 * values are shown first; USD is only used when no Rial price exists.
 */
export function startingPrice(event: EventPriceFields): string | null {
  const irr =
    event.status === "past"
      ? [event.recording_price_irr]
      : [event.price_in_person_irr, event.price_online_irr];

  const usd =
    event.status === "past"
      ? [event.recording_price_usd]
      : [event.price_in_person_usd, event.price_online_usd];

  const rialValues = irr.filter((value): value is number => value !== null);
  if (rialValues.some((value) => value === 0)) return "رایگان";
  if (rialValues.length > 0) {
    return `از ${formatPrice(Math.min(...rialValues), "IRR")}`;
  }

  const dollarValues = usd.filter((value): value is number => value !== null);
  if (dollarValues.some((value) => value === 0)) return "رایگان";
  if (dollarValues.length > 0) {
    return `از ${formatPrice(Math.min(...dollarValues), "USD")}`;
  }

  return null;
}

/** Free events have a zero price; show «رایگان» instead of «۰ تومان». */
export function isFreePrice(value: number | null): boolean {
  return value === 0;
}
