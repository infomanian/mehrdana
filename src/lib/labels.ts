import type {
  CurrencyCode,
  EventStatus,
  PaymentGateway,
  TicketStatus,
  TicketType,
  UserRole,
} from "@/types/database";

/** Persian labels for database enums used on the profile page. */
export const ticketTypeLabels: Record<TicketType, string> = {
  in_person: "حضوری",
  online: "آنلاین",
  recording_only: "فقط ضبط",
};

export const eventStatusLabels: Record<EventStatus, string> = {
  upcoming: "پیشرو",
  live: "در حال برگزاری",
  past: "برگزارشده",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  pending: "در انتظار تأیید",
  verified: "تأییدشده",
  rejected: "ردشده",
};

export const paymentGatewayLabels: Record<PaymentGateway, string> = {
  fidibo: "فیدیبو",
  stripe: "استرایپ",
  paypal: "پی‌پال",
};

export const roleLabels: Record<UserRole, string> = {
  user: "عضو مهر دانا",
  speaker: "سخنران",
  admin: "مدیر",
};

export const currencyLabels: Record<CurrencyCode, string> = {
  IRR: "تومان",
  USD: "دلار",
};
