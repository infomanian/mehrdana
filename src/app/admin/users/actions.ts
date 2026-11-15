"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/validation";

export async function setUserBanned(
  userId: string,
  banned: boolean,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(userId)) return { ok: false, message: "شناسه کاربر معتبر نیست." };

  const { supabase, user } = await requireAdmin("/admin/users");
  if (userId === user.id) return { ok: false, message: "نمی‌توانید خودتان را بن کنید." };

  const { error } = await supabase
    .from("profiles")
    .update(
      banned
        ? { is_banned: true, banned_at: new Date().toISOString(), banned_by: user.id }
        : { is_banned: false, banned_at: null, banned_by: null },
    )
    .eq("id", userId);

  if (error) return { ok: false, message: "تغییر وضعیت انجام نشد. دوباره تلاش کنید." };

  revalidatePath("/admin/users");
  revalidatePath("/admin/reports");
  return { ok: true };
}
