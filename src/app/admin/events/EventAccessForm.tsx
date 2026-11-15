"use client";

import { useActionState } from "react";

import { Card } from "@/components/ui/Card";
import { Field, inputStyles, describedBy } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LockIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

import { updateEventAccess } from "./actions";
import { initialEventActionState } from "./state";

export function EventAccessForm({
  eventId,
  skyroomLink,
  recordingUrl,
}: {
  eventId: string;
  skyroomLink: string;
  recordingUrl: string;
}) {
  const [state, formAction] = useActionState(updateEventAccess, initialEventActionState);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-navy-800/8 text-navy-800">
          <LockIcon className="size-4" />
        </span>
        <h2 className="text-base font-bold text-navy-900">لینک‌های اختصاصی</h2>
      </div>

      <p className="mt-2 text-xs leading-6 text-ink-muted">
        این لینک‌ها فقط برای دارندگان بلیت تأییدشده (و سخنران/مدیر) نمایش داده می‌شوند و
        هرگز در صفحه عمومی رویداد دیده نمی‌شوند.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={eventId} />

        <Field
          id="skyroom_link"
          label="لینک پخش زنده اسکایروم"
          error={state.errors?.skyroom_link}
        >
          <input
            id="skyroom_link"
            name="skyroom_link"
            type="url"
            dir="ltr"
            defaultValue={skyroomLink}
            placeholder="https://..."
            aria-invalid={state.errors?.skyroom_link ? true : undefined}
            aria-describedby={describedBy("skyroom_link", undefined, state.errors?.skyroom_link)}
            className={cn(inputStyles, "text-start")}
          />
        </Field>

        <Field
          id="recording_media_url"
          label="لینک ویدیوی ضبط‌شده"
          error={state.errors?.recording_media_url}
        >
          <input
            id="recording_media_url"
            name="recording_media_url"
            type="url"
            dir="ltr"
            defaultValue={recordingUrl}
            placeholder="https://..."
            aria-invalid={state.errors?.recording_media_url ? true : undefined}
            aria-describedby={describedBy(
              "recording_media_url",
              undefined,
              state.errors?.recording_media_url,
            )}
            className={cn(inputStyles, "text-start")}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <SubmitButton variant="navy" size="sm" pendingLabel="در حال ذخیره…">
            ذخیره لینک‌ها
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
