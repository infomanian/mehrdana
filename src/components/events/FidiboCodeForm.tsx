"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { verifyFidiboCodeAction } from "@/app/events/actions";
import { initialFidiboCodeState } from "@/app/events/state";
import { inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";

/**
 * Lets a signed-in user redeem a Fidibo code. The code itself never leaves this
 * input to a list query; the server action calls the atomic verification
 * function and the page refreshes when the ticket becomes verified.
 */
export function FidiboCodeForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [state, action] = useActionState(verifyFidiboCodeAction, initialFidiboCodeState);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="event_id" value={eventId} />

      <div className="flex gap-2">
        <input
          name="code"
          type="text"
          dir="ltr"
          autoComplete="off"
          maxLength={64}
          placeholder="کد بلیت فیدیبو"
          aria-label="کد بلیت فیدیبو"
          className={cn(inputStyles, "text-start")}
        />
        <SubmitButton size="md" pendingLabel="در حال بررسی…" className="shrink-0">
          ثبت کد
        </SubmitButton>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          "mt-2 text-xs leading-6",
          state.message ? (state.ok ? "text-verified-strong" : "text-accent-strong") : "sr-only",
        )}
      >
        {state.message ?? ""}
      </p>
    </form>
  );
}
