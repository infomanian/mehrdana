"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/validation";

export async function resolveReport(
  reportId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(reportId)) return { ok: false, message: "شناسه گزارش معتبر نیست." };

  const { supabase } = await requireAdmin("/admin/reports");

  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) return { ok: false, message: "تغییر وضعیت انجام نشد." };

  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function deleteMessage(
  messageId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(messageId)) return { ok: false, message: "شناسه پیام معتبر نیست." };

  const { supabase } = await requireAdmin("/admin/reports");

  const { error } = await supabase.from("event_messages").delete().eq("id", messageId);

  if (error) return { ok: false, message: "حذف پیام انجام نشد." };

  revalidatePath("/admin/reports");
  return { ok: true };
}
