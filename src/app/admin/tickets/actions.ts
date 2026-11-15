"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/validation";

export async function setTicketStatus(
  ticketId: string,
  status: "verified" | "rejected",
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(ticketId)) return { ok: false, message: "شناسه بلیت معتبر نیست." };
  if (status !== "verified" && status !== "rejected") {
    return { ok: false, message: "وضعیت معتبر نیست." };
  }

  const { supabase } = await requireAdmin("/admin/tickets");

  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  if (error) return { ok: false, message: "تغییر وضعیت انجام نشد. دوباره تلاش کنید." };

  revalidatePath("/admin/tickets");
  revalidatePath("/profile");
  return { ok: true };
}
