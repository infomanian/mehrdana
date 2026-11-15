"use client";

import { useActionState, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Field, inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

import { updateProfile } from "./actions";
import { initialProfileState } from "./state";

const MAX_INTERESTS = 10;
const MAX_BIO = 600;

export type ProfileFormValues = {
  fullName: string;
  profession: string;
  bio: string;
  interests: string[];
  instagram: string;
  linkedin: string;
  telegram: string;
  website: string;
};

const socialFields = [
  {
    key: "instagram",
    label: "اینستاگرام",
    placeholder: "username",
    autoComplete: "off",
  },
  {
    key: "telegram",
    label: "تلگرام",
    placeholder: "username",
    autoComplete: "off",
  },
  {
    key: "linkedin",
    label: "لینکدین",
    placeholder: "linkedin.com/in/username",
    autoComplete: "off",
  },
  {
    key: "website",
    label: "وب‌سایت",
    placeholder: "example.com",
    autoComplete: "url",
  },
] as const;

export function ProfileForm({
  initial,
  categories,
}: {
  initial: ProfileFormValues;
  categories: string[];
}) {
  const [state, action] = useActionState(updateProfile, initialProfileState);
  const [bioLength, setBioLength] = useState(initial.bio.length);
  const [selected, setSelected] = useState<string[]>(initial.interests);

  const chips = Array.from(new Set([...categories, ...initial.interests]));

  function toggleInterest(name: string, checked: boolean) {
    setSelected((current) => {
      if (!checked) return current.filter((item) => item !== name);
      if (current.includes(name) || current.length >= MAX_INTERESTS) return current;
      return [...current, name];
    });
  }

  return (
    <Card className="p-5 sm:p-6" id="profile-form">
      <h2 className="text-base font-bold text-navy-900">اطلاعات پروفایل</h2>
      <p className="mt-1 text-xs leading-6 text-ink-muted">
        این اطلاعات در فهرست شرکت‌کنندگان رویدادها به دیگران نشان داده می‌شود؛ هر بخش را
        می‌توانید خالی بگذارید.
      </p>

      <form action={action} className="mt-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="full_name" label="نام و نام خانوادگی" error={state.errors?.full_name}>
            <input
              id="full_name"
              name="full_name"
              type="text"
              maxLength={80}
              autoComplete="name"
              defaultValue={initial.fullName}
              placeholder="مثلاً سارا احمدی"
              aria-invalid={state.errors?.full_name ? true : undefined}
              aria-describedby={state.errors?.full_name ? "full_name-error" : undefined}
              className={inputStyles}
            />
          </Field>

          <Field id="profession" label="تخصص یا شغل" error={state.errors?.profession}>
            <input
              id="profession"
              name="profession"
              type="text"
              maxLength={80}
              defaultValue={initial.profession}
              placeholder="مثلاً روان‌شناس بالینی"
              aria-invalid={state.errors?.profession ? true : undefined}
              aria-describedby={state.errors?.profession ? "profession-error" : undefined}
              className={inputStyles}
            />
          </Field>
        </div>

        <Field
          id="bio"
          label="درباره من"
          hint={`${formatNumber(bioLength)} از ${formatNumber(MAX_BIO)} نویسه`}
          error={state.errors?.bio}
        >
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={MAX_BIO}
            defaultValue={initial.bio}
            onChange={(event) => setBioLength(event.target.value.length)}
            placeholder="در دو یا سه خط بگویید چه کاری می‌کنید و دنبال چه هستید."
            aria-invalid={state.errors?.bio ? true : undefined}
            aria-describedby={state.errors?.bio ? "bio-error" : "bio-hint"}
            className={cn(inputStyles, "min-h-28 resize-y leading-7")}
          />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-navy-900">علاقه‌مندی‌ها</legend>
          <p className="mt-1 text-xs leading-6 text-ink-muted">
            حداکثر {formatNumber(MAX_INTERESTS)} مورد؛ {formatNumber(selected.length)} مورد
            انتخاب شده است.
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {chips.map((name) => {
              const isSelected = selected.includes(name);
              const isDisabled = !isSelected && selected.length >= MAX_INTERESTS;

              return (
                <label key={name} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="interests"
                    value={name}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={(event) => toggleInterest(name, event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors peer-checked:border-verified-strong peer-checked:bg-verified/12 peer-checked:text-verified-strong peer-focus-visible:outline-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
                    {name}
                  </span>
                </label>
              );
            })}
          </div>

          {state.errors?.interests ? (
            <p className="mt-2 text-xs font-medium text-accent-strong">
              {state.errors.interests}
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-navy-900">شبکه‌های اجتماعی</legend>
          <p className="mt-1 text-xs leading-6 text-ink-muted">
            وارد کردن همه اختیاری است. فقط نام کاربری یا آدرس کامل را بنویسید.
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {socialFields.map((field) => (
              <Field
                key={field.key}
                id={field.key}
                label={field.label}
                error={state.errors?.[field.key]}
              >
                <input
                  id={field.key}
                  name={field.key}
                  type="text"
                  dir="ltr"
                  maxLength={200}
                  autoComplete={field.autoComplete}
                  defaultValue={initial[field.key]}
                  placeholder={field.placeholder}
                  aria-invalid={state.errors?.[field.key] ? true : undefined}
                  aria-describedby={
                    state.errors?.[field.key] ? `${field.key}-error` : undefined
                  }
                  className={cn(inputStyles, "text-start")}
                />
              </Field>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <SubmitButton pendingLabel="در حال ذخیره…">ذخیره تغییرات</SubmitButton>

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
