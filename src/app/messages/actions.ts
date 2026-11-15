"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import { MESSAGE_PAGE_SIZE } from "@/lib/chat";
import type { DmMessage } from "@/lib/networking";
import { getServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

async function context() {
  const supabase = await getServerClient();
  const user = await getSessionUser();
  if (!supabase || !user) return null;
  return { supabase, user };
}

/** Sends a friend request. */
export async function sendFriendRequest(
  receiverId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(receiverId)) return { ok: false, message: "شناسه کاربر معتبر نیست." };

  const ctx = await context();
  if (!ctx) return { ok: false, message: "ابتدا وارد حساب شوید." };
  if (receiverId === ctx.user.id) {
    return { ok: false, message: "نمی‌توانید به خودتان درخواست بدهید." };
  }

  const { error } = await ctx.supabase
    .from("connections")
    .insert({ requester_id: ctx.user.id, receiver_id: receiverId });

  if (error) {
    if (error.code === "23505") return { ok: true, message: "درخواست قبلاً ارسال شده است." };
    return { ok: false, message: "ارسال درخواست انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/messages");
  return { ok: true, message: "درخواست دوستی ارسال شد." };
}

/** Accepts or rejects an incoming friend request (receiver only, via RLS). */
export async function respondToRequest(
  connectionId: string,
  action: "accepted" | "rejected",
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(connectionId)) return { ok: false, message: "شناسه درخواست معتبر نیست." };

  const ctx = await context();
  if (!ctx) return { ok: false, message: "ابتدا وارد حساب شوید." };

  const { error } = await ctx.supabase
    .from("connections")
    .update({ status: action })
    .eq("id", connectionId);

  if (error) return { ok: false, message: "تغییر وضعیت انجام نشد. دوباره تلاش کنید." };

  revalidatePath("/messages");
  return { ok: true };
}

/** Older direct messages for the "load older" button. */
export async function loadOlderDmMessages(
  connectionId: string,
  before: string,
): Promise<{ messages?: DmMessage[]; error?: string }> {
  if (!isUuid(connectionId)) return { error: "invalid" };

  const ctx = await context();
  if (!ctx) return { error: "auth-required" };

  const { data, error } = await ctx.supabase.rpc("get_direct_messages", {
    p_connection_id: connectionId,
    p_before: before ?? null,
    p_limit: MESSAGE_PAGE_SIZE,
  });

  if (error) return { error: "failed" };
  return { messages: (data ?? []) as DmMessage[] };
}

/** Globally blocks a DM partner (freezes the conversation). */
export async function blockDmUser(
  blockedId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(blockedId)) return { ok: false, message: "شناسه کاربر معتبر نیست." };

  const ctx = await context();
  if (!ctx) return { ok: false, message: "ابتدا وارد حساب شوید." };
  if (blockedId === ctx.user.id) return { ok: false, message: "نمی‌توانید خودتان را مسدود کنید." };

  const { error } = await ctx.supabase
    .from("user_blocks")
    .insert({ blocker_id: ctx.user.id, blocked_id: blockedId });

  if (error) {
    if (error.code === "23505") return { ok: true, message: "این کاربر قبلاً مسدود شده است." };
    return { ok: false, message: "مسدودسازی انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/messages");
  return { ok: true, message: "کاربر مسدود شد." };
}
