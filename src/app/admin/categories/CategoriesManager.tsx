"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";

import { saveCategory, type CategoryActionState } from "./actions";

export type CategoryRow = { id: string; name: string; slug: string };

const initial: CategoryActionState = {};

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [state, action] = useActionState(saveCategory, initial);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Derive the edited row from the latest server data so the form stays fresh
  // after a save + refresh.
  const editing = editingId ? (categories.find((c) => c.id === editingId) ?? null) : null;

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <h2 className="text-base font-bold text-navy">
          {editing ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
        </h2>

        <form key={editing?.id ?? "new"} action={action} className="mt-4 space-y-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="نام" error={state.errors?.name}>
              <input
                id="name"
                name="name"
                type="text"
                maxLength={60}
                defaultValue={editing?.name ?? ""}
                placeholder="مثلاً روان‌شناسی"
                className={inputStyles}
              />
            </Field>

            <Field
              id="slug"
              label="شناسه (slug)"
              hint="مثلاً psychology"
              error={state.errors?.slug}
            >
              <input
                id="slug"
                name="slug"
                type="text"
                dir="ltr"
                defaultValue={editing?.slug ?? ""}
                placeholder="psychology"
                className={cn(inputStyles, "text-start")}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <SubmitButton size="sm" pendingLabel="در حال ذخیره…">
              {editing ? "ذخیره تغییرات" : "افزودن"}
            </SubmitButton>

            {editing ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                انصراف
              </Button>
            ) : null}

            <p
              role="status"
              aria-live="polite"
              className={cn(
                "text-xs leading-6",
                state.ok ? "text-verified-strong" : "text-accent-strong",
              )}
            >
              {state.message ?? ""}
            </p>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-line">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy">{category.name}</p>
                <p dir="ltr" className="truncate text-start text-xs text-ink-muted">
                  {category.slug}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(category.id)}
              >
                ویرایش
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
