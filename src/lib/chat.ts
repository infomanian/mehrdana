/**
 * Shared chat types and constants. Imported by both server components and the
 * chat client component, so it must not use `server-only`.
 */

export type ChatMessage = {
  id: string;
  event_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string | null;
  sender_avatar: string | null;
};

export const REPORT_REASONS = ["اسپم", "آزار", "محتوای نامناسب", "سایر"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const MAX_MESSAGE_LENGTH = 1000;
export const MESSAGE_PAGE_SIZE = 50;
