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
