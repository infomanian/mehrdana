"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import type { Json } from "@/types/database";
import { parseProfileForm } from "@/lib/validation";

import { type ProfileActionState } from "./state";

/** Saves the editable fields of the signed-in user's profile. */
export async function updateProfile(
  _previous: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { supabase, user } = await requireSession("/profile");
  const { data, errors } = parseProfileForm(formData);

  if (Object.keys(errors).length > 0) {
    return { errors, message: "لطفاً موارد مشخص‌شده را اصلاح کنید." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      profession: data.profession,
      bio: data.bio,
      interests: data.interests,
      social_links: data.social_links as Json,
    })
    .eq("id", user.id);

  if (error) {
    return { message: "ذخیره تغییرات انجام نشد. چند لحظه بعد دوباره تلاش کنید." };
  }

  revalidatePath("/profile");
  return { ok: true, message: "تغییرات ذخیره شد." };
}

/**
 * Toggles the "hide my profile" flag. Only the caller's own row can be updated:
 * the filter plus the existing RLS policy enforce that, and `is_public` is not a
 * privileged field (role changes are blocked by a database trigger).
 */
export async function setProfileVisibility(formData: FormData): Promise<void> {
  const { supabase, user } = await requireSession("/profile");
  const isPublic = formData.get("is_public") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({ is_public: isPublic })
    .eq("id", user.id);

  if (!error) revalidatePath("/profile");
  // On failure the switch is simply re-rendered with the stored value again.
}

const AVATAR_PATH = /^[0-9a-f-]{36}\/avatar\.(jpg|png|webp)$/;

/**
 * Stores the public URL of a freshly uploaded avatar.
 * The browser uploads the file straight to Storage (so large files never travel
 * through a Server Action); only the resulting path is sent here, and it must
 * live inside the caller's own folder.
 */
export async function saveAvatarPath(
  path: string,
): Promise<{ ok: boolean; message?: string }> {
  const { supabase, user } = await requireSession("/profile");

  if (!AVATAR_PATH.test(path) || !path.startsWith(`${user.id}/`)) {
    return { ok: false, message: "مسیر تصویر معتبر نیست." };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  if (!data.publicUrl) return { ok: false, message: "آدرس تصویر ساخته نشد." };

  // A version suffix defeats the browser cache after re-uploading.
  const versioned = `${data.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: versioned })
    .eq("id", user.id);

  if (error) return { ok: false, message: "ذخیره تصویر انجام نشد. دوباره تلاش کنید." };

  revalidatePath("/profile");
  return { ok: true };
}
