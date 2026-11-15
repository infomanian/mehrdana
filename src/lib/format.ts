/**
 * Persian formatting helpers built on the platform Intl API.
 * No date library is needed: the browser already knows the Persian calendar.
 */
const numberFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

const moneyFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

/**
 * Prices are stored in IRR (see the events table). Persian readers think in
 * Toman, so the value is divided by 10 for display only — the database keeps
 * the exact Rial amount.
 */
export function formatPrice(amount: number | null, currency: "IRR" | "USD"): string {
  if (amount === null || Number.isNaN(amount)) return "—";
  if (currency === "USD") return `${moneyFormatter.format(amount)} دلار`;
  return `${moneyFormatter.format(Math.round(amount / 10))} تومان`;
}

/** Gregorian input (ISO string or Date) rendered as a Persian (Jalali) date. */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

/**
 * Event times are shown in Iran time regardless of where the server runs.
 * Without this, a UTC server would render a 19:00 Tehran event as 15:30.
 */
export const tehranTimeZone = "Asia/Tehran";

const eventDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: tehranTimeZone,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const eventDateTimeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: tehranTimeZone,
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return eventDateFormatter.format(date);
}

export function formatEventDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return eventDateTimeFormatter.format(date);
}

const eventTimeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: tehranTimeZone,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return eventTimeFormatter.format(date);
}

const inputPartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: tehranTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** ISO date -> the `YYYY-MM-DDTHH:mm` value a datetime-local input expects (Tehran). */
export function toTehranDateTimeInput(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const parts = inputPartsFormatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * Tehran is a fixed +03:30 offset (no daylight saving since 2022). Parsing the
 * admin input manually avoids the server's own timezone leaking into the value.
 * Invalid calendar dates such as 2026-02-30 are rejected instead of rolling over.
 */
export function parseTehranDateTimeInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+03:30`);
  if (Number.isNaN(date.getTime())) return null;
  if (toTehranDateTimeInput(date) !== value.trim()) return null;

  return date;
}

const yearFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" });

/** Current year in the Persian calendar, e.g. ۱۴۰۵. */
export function formatYear(value: Date = new Date()): string {
  return yearFormatter.format(value);
}
