import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin";

import { CategoriesManager, type CategoryRow } from "./CategoriesManager";

export const metadata: Metadata = {
  title: "دسته‌بندی‌ها",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin("/admin/categories");

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) throw new Error("admin-categories-unavailable");

  const categories = (data ?? []) as CategoryRow[];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-navy-900">دسته‌بندی‌ها</h1>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        دسته‌بندی‌های رویدادها را اضافه یا ویرایش کنید؛ در فیلترهای سایت و فرم رویداد
        نمایش داده می‌شوند.
      </p>

      <div className="mt-5">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
