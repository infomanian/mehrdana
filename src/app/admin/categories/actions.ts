"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { isUuid, type FieldErrors } from "@/lib/validation";

export type CategoryActionState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
};

const GENERIC_ERROR = "ذخیره دسته‌بندی انجام نشد. دوباره تلاش کنید.";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function saveCategory(
  _previous: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { supabase } = await requireAdmin("/admin/categories");

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();

  const errors: FieldErrors = {};
  if (name.length < 1 || name.length > 60) {
    errors.name = "نام دسته‌بندی باید بین ۱ تا ۶۰ نویسه باشد.";
  }
  if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "شناسه فقط با حروف انگلیسی کوچک، عدد و خط تیره (مثل psychology).";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "لطفاً موارد مشخص‌شده را اصلاح کنید." };
  }

  if (id) {
    if (!isUuid(id)) return { message: "شناسه دسته‌بندی معتبر نیست." };
    const { error } = await supabase.from("categories").update({ name, slug }).eq("id", id);
    if (error) {
      return { message: error.code === "23505" ? "این شناسه تکراری است." : GENERIC_ERROR };
    }
  } else {
    const { error } = await supabase.from("categories").insert({ name, slug });
    if (error) {
      return { message: error.code === "23505" ? "این شناسه تکراری است." : GENERIC_ERROR };
    }
  }

  revalidatePath("/admin/categories");
  revalidatePath("/events");
  return { ok: true, message: id ? "دسته‌بندی ویرایش شد." : "دسته‌بندی اضافه شد." };
}
