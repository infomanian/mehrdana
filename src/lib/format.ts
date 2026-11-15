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

const yearFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" });

/** Current year in the Persian calendar, e.g. ۱۴۰۵. */
export function formatYear(value: Date = new Date()): string {
  return yearFormatter.format(value);
}
