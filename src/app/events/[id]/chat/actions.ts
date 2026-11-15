"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import { REPORT_REASONS, MESSAGE_PAGE_SIZE, type ChatMessage } from "@/lib/chat";
import { getServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

async function chatContext() {
  const supabase = await getServerClient();
  const user = await getSessionUser();
  if (!supabase || !user) return null;
  return { supabase, user };
}

/** Older messages for the "load older" button (blocked senders are excluded). */
export async function loadOlderMessages(
  eventId: string,
  before: string,
): Promise<{ messages?: ChatMessage[]; error?: string }> {
  if (!isUuid(eventId)) return { error: "invalid" };

  const ctx = await chatContext();
  if (!ctx) return { error: "auth-required" };

  const { data, error } = await ctx.supabase.rpc("get_event_messages", {
    p_event_id: eventId,
    p_before: before ?? null,
    p_limit: MESSAGE_PAGE_SIZE,
  });

  if (error) return { error: "failed" };
  return { messages: (data ?? []) as ChatMessage[] };
}

/** Globally hides a user's messages from the caller. */
export async function blockUser(
  eventId: string,
  blockedId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(blockedId)) return { ok: false, message: "شناسه کاربر معتبر نیست." };

  const ctx = await chatContext();
  if (!ctx) return { ok: false, message: "ابتدا وارد حساب شوید." };
  if (blockedId === ctx.user.id) return { ok: false, message: "نمی‌توانید خودتان را مسدود کنید." };

  const { error } = await ctx.supabase
    .from("user_blocks")
    .insert({ blocker_id: ctx.user.id, blocked_id: blockedId });

  if (error) {
    if (error.code === "23505") return { ok: true, message: "این کاربر قبلاً مسدود شده است." };
    return { ok: false, message: "مسدودسازی انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath(`/events/${eventId}/chat`);
  return { ok: true, message: "کاربر مسدود شد." };
}

/** Reports a chat message. The reported user is derived from the message server-side. */
export async function reportMessage(
  eventId: string,
  messageId: string,
  reason: string,
  note: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(messageId)) return { ok: false, message: "شناسه پیام معتبر نیست." };
  if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
    return { ok: false, message: "دلیل گزارش معتبر نیست." };
  }

  const trimmedNote = note.trim();
  if (trimmedNote.length > 500) {
    return { ok: false, message: "توضیح گزارش بیش از حد طولانی است." };
  }

  const ctx = await chatContext();
  if (!ctx) return { ok: false, message: "ابتدا وارد حساب شوید." };

  const { data: message } = await ctx.supabase
    .from("event_messages")
    .select("sender_id")
    .eq("id", messageId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (!message) return { ok: false, message: "پیام پیدا نشد." };
  if (message.sender_id === ctx.user.id) {
    return { ok: false, message: "نمی‌توانید پیام خود را گزارش دهید." };
  }

  const { error } = await ctx.supabase.from("reports").insert({
    reporter_id: ctx.user.id,
    reported_user_id: message.sender_id,
    message_id: messageId,
    reason,
    note: trimmedNote || null,
  });

  if (error) return { ok: false, message: "ثبت گزارش انجام نشد. دوباره تلاش کنید." };

  return { ok: true, message: "گزارش شما ثبت شد. از همراهی شما سپاسگزاریم." };
}
