"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Field, inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TicketIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

import { addFidiboCodes, type FidiboCodesState } from "./actions";

const initial: FidiboCodesState = {};

/** Bulk upload of Fidibo codes: one code per line + a ticket type. */
export function FidiboCodesForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [state, action] = useActionState(addFidiboCodes, initial);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-navy/8 text-navy">
          <TicketIcon className="size-4" />
        </span>
        <h2 className="text-base font-bold text-navy">کدهای فیدیبو</h2>
      </div>

      <p className="mt-2 text-xs leading-6 text-ink-muted">
        کدهای معتبر فیدیبو را وارد کنید تا کاربران بتوانند همان‌لحظه با وارد کردن کد، بلیت
        تأییدشده بگیرند. هر خط یک کد.
      </p>

      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="event_id" value={eventId} />

        <Field id="ticket_type" label="نوع بلیت">
          <select id="ticket_type" name="ticket_type" defaultValue="online" className={cn(inputStyles, "appearance-none")}>
            <option value="online">آنلاین</option>
            <option value="in_person">حضوری</option>
            <option value="recording_only">ضبط رویداد</option>
          </select>
        </Field>

        <Field id="codes" label="کدها">
          <textarea
            id="codes"
            name="codes"
            rows={6}
            dir="ltr"
            placeholder={"CODE-1\nCODE-2"}
            className={cn(inputStyles, "min-h-28 resize-y text-start")}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <SubmitButton variant="ink" size="sm" pendingLabel="در حال ثبت…">
            ثبت کدها
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
