"use client";

import { useActionState } from "react";

import { Card } from "@/components/ui/Card";
import { Field, inputStyles, describedBy } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import type { EventStatus } from "@/types/database";

import { createEvent, updateEvent } from "./actions";
import { initialEventActionState } from "./state";

export type EventFormDefaults = {
  title: string;
  description: string;
  category_id: string;
  speaker_id: string;
  status: EventStatus;
  event_date: string;
  location_address: string;
  fidibo_url: string;
  price_in_person_toman: string;
  price_online_toman: string;
  recording_price_toman: string;
  price_in_person_usd: string;
  price_online_usd: string;
  recording_price_usd: string;
};

type Option = { id: string; label: string };

const tomanFields = [
  { key: "price_in_person_toman", label: "حضوری (تومان)" },
  { key: "price_online_toman", label: "آنلاین (تومان)" },
  { key: "recording_price_toman", label: "ضبط (تومان)" },
] as const;

const usdFields = [
  { key: "price_in_person_usd", label: "حضوری (دلار)" },
  { key: "price_online_usd", label: "آنلاین (دلار)" },
  { key: "recording_price_usd", label: "ضبط (دلار)" },
] as const;

export function EventForm({
  mode,
  defaults,
  categories,
  speakers,
  eventId,
}: {
  mode: "create" | "edit";
  defaults: EventFormDefaults;
  categories: Option[];
  speakers: Option[];
  eventId?: string;
}) {
  const action = mode === "create" ? createEvent : updateEvent;
  const [state, formAction] = useActionState(action, initialEventActionState);

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-bold text-navy">
        {mode === "create" ? "رویداد جدید" : "ویرایش رویداد"}
      </h2>

      <form action={formAction} className="mt-5 space-y-6">
        {mode === "edit" ? <input type="hidden" name="id" value={eventId} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="title" label="عنوان رویداد" error={state.errors?.title} className="sm:col-span-2">
            <input
              id="title"
              name="title"
              type="text"
              maxLength={160}
              defaultValue={defaults.title}
              placeholder="مثلاً آشنایی با روان‌شناسی شناختی"
              aria-invalid={state.errors?.title ? true : undefined}
              aria-describedby={describedBy("title", undefined, state.errors?.title)}
              className={inputStyles}
            />
          </Field>

          <Field id="category_id" label="دسته‌بندی" error={state.errors?.category_id}>
            <select
              id="category_id"
              name="category_id"
              defaultValue={defaults.category_id}
              className={cn(inputStyles, "appearance-none")}
            >
              <option value="">بدون دسته‌بندی</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="speaker_id" label="سخنران" error={state.errors?.speaker_id}>
            <select
              id="speaker_id"
              name="speaker_id"
              defaultValue={defaults.speaker_id}
              className={cn(inputStyles, "appearance-none")}
            >
              <option value="">بدون سخنران</option>
              {speakers.map((speaker) => (
                <option key={speaker.id} value={speaker.id}>
                  {speaker.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="status" label="وضعیت رویداد">
            <select
              id="status"
              name="status"
              defaultValue={defaults.status}
              className={cn(inputStyles, "appearance-none")}
            >
              <option value="upcoming">آینده</option>
              <option value="live">در حال برگزاری</option>
              <option value="past">برگزارشده</option>
            </select>
          </Field>

          <Field
            id="event_date"
            label="تاریخ و ساعت"
            hint="به وقت تهران"
            error={state.errors?.event_date}
          >
            <input
              id="event_date"
              name="event_date"
              type="datetime-local"
              defaultValue={defaults.event_date}
              dir="ltr"
              aria-invalid={state.errors?.event_date ? true : undefined}
              aria-describedby={describedBy("event_date", "به وقت تهران", state.errors?.event_date)}
              className={cn(inputStyles, "text-start")}
            />
          </Field>

          <Field id="location_address" label="نشانی محل برگزاری" className="sm:col-span-2">
            <input
              id="location_address"
              name="location_address"
              type="text"
              maxLength={300}
              defaultValue={defaults.location_address}
              placeholder="برای رویداد فقط آنلاین، خالی بگذارید"
              className={inputStyles}
            />
          </Field>

          <Field
            id="fidibo_url"
            label="لینک خرید فیدیبو"
            hint="اختیاری؛ فقط https"
            error={state.errors?.fidibo_url}
            className="sm:col-span-2"
          >
            <input
              id="fidibo_url"
              name="fidibo_url"
              type="url"
              dir="ltr"
              defaultValue={defaults.fidibo_url}
              placeholder="https://fidibo.com/..."
              aria-invalid={state.errors?.fidibo_url ? true : undefined}
              aria-describedby={describedBy("fidibo_url", "اختیاری؛ فقط https", state.errors?.fidibo_url)}
              className={cn(inputStyles, "text-start")}
            />
          </Field>
        </div>

        <Field
          id="description"
          label="توضیحات رویداد"
          hint="متن ساده؛ هر خط همان‌طور که می‌نویسید نمایش داده می‌شود."
          error={state.errors?.description}
        >
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={20000}
            defaultValue={defaults.description}
            className={cn(inputStyles, "min-h-32 resize-y leading-7")}
          />
        </Field>

        <fieldset>
          <legend className="text-sm font-bold text-navy">قیمت‌ها</legend>
          <p className="mt-1 text-xs leading-6 text-ink-muted">
            قیمت‌ها را به تومان وارد کنید (به‌صورت خودکار ذخیره می‌شود). قیمت دلاری
            اختیاری است و فقط برای کاربران خارج از ایران نمایش داده می‌شود.
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {tomanFields.map((field) => (
              <Field key={field.key} id={field.key} label={field.label} error={state.errors?.[field.key]}>
                <input
                  id={field.key}
                  name={field.key}
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  defaultValue={defaults[field.key]}
                  placeholder="0"
                  aria-invalid={state.errors?.[field.key] ? true : undefined}
                  aria-describedby={describedBy(field.key, undefined, state.errors?.[field.key])}
                  className={cn(inputStyles, "text-start")}
                />
              </Field>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {usdFields.map((field) => (
              <Field key={field.key} id={field.key} label={field.label} error={state.errors?.[field.key]}>
                <input
                  id={field.key}
                  name={field.key}
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  defaultValue={defaults[field.key]}
                  placeholder="0.00"
                  aria-invalid={state.errors?.[field.key] ? true : undefined}
                  aria-describedby={describedBy(field.key, undefined, state.errors?.[field.key])}
                  className={cn(inputStyles, "text-start")}
                />
              </Field>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <SubmitButton pendingLabel="در حال ذخیره…">
            {mode === "create" ? "ساخت رویداد" : "ذخیره تغییرات"}
          </SubmitButton>

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
  );
}
