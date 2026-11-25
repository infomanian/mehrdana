"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, describedBy, fieldBase, inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

import { requestEmailCode, verifyEmailCode } from "./actions";
import { initialLoginState } from "./state";

const RESEND_SECONDS = 60;

const EMAIL_HINT =
  "کد ورود به همین ایمیل فرستاده می‌شود. اگر حساب ندارید، در همان لحظه ساخته می‌شود.";
const TOKEN_HINT = "۶ رقمی که به ایمیل شما فرستاده شد.";

export function LoginForm({
  nextPath,
  configured,
}: {
  nextPath: string;
  configured: boolean;
}) {
  const [requestState, requestAction] = useActionState(requestEmailCode, initialLoginState);
  const [verifyState, verifyAction] = useActionState(verifyEmailCode, initialLoginState);

  // Remembers which delivery the user dismissed, so "change email" needs no
  // effect and a newly sent code always returns to the code step.
  const [dismissedSentAt, setDismissedSentAt] = useState<number | null>(null);

  const showCodeStep =
    requestState.step === "code" &&
    requestState.sentAt !== undefined &&
    requestState.sentAt !== dismissedSentAt;

  const email = requestState.email || verifyState.email;
  const emailError = requestState.step === "email" ? requestState.emailError : undefined;
  const sendMessage = requestState.step === "email" ? requestState.message : undefined;
  const codeStepMessage = requestState.step === "code" ? requestState.message : undefined;
  const codeError =
    verifyState.email === email && verifyState.sentAt === requestState.sentAt
      ? verifyState.codeError
      : undefined;

  return (
    <Card className="p-6 sm:p-8">
      {!configured ? (
        <p
          role="status"
          className="mb-5 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3 text-xs leading-6 text-accent-strong"
        >
          سرویس ورود هنوز به سرور وصل نشده است. پس از تنظیم کلیدهای Supabase در فایل
          <code className="mx-1 rounded bg-white/60 px-1 py-0.5 font-mono text-[11px]" dir="ltr">
            .env
          </code>
          این بخش فعال می‌شود.
        </p>
      ) : null}

      {showCodeStep ? (
        <>
          <div
            role="status"
            className="rounded-xl border border-verified/25 bg-verified/8 px-4 py-3 text-sm leading-7 text-charcoal"
          >
            کد ۶ رقمی به{" "}
            <span dir="ltr" className="font-medium">
              {email}
            </span>{" "}
            ارسال شد. اگر ایمیل را نمی‌بینید، پوشه هرزنامه را هم بررسی کنید.
          </div>

          <form action={verifyAction} className="mt-5 space-y-4">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="next" value={nextPath} />
            <input type="hidden" name="sentAt" value={requestState.sentAt ?? ""} />

            <Field id="token" label="کد ورود" hint={TOKEN_HINT} error={codeError}>
              <input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                dir="ltr"
                placeholder="——————"
                aria-invalid={codeError ? true : undefined}
                aria-describedby={describedBy("token", TOKEN_HINT, codeError)}
                className={cn(fieldBase, "text-center text-xl tracking-[0.35em]")}
              />
            </Field>

            <SubmitButton
              size="lg"
              className="w-full"
              pendingLabel="در حال بررسی…"
              disabled={!configured}
            >
              تأیید و ورود
            </SubmitButton>
          </form>

          {codeStepMessage ? (
            <p role="alert" className="mt-3 text-xs leading-6 text-accent-strong">
              {codeStepMessage}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissedSentAt(requestState.sentAt ?? null)}
            >
              تغییر ایمیل
            </Button>

            {/* A fresh key restarts the cooldown, no effect needed. */}
            <ResendForm
              key={requestState.sentAt}
              email={email}
              action={requestAction}
              disabled={!configured}
            />
          </div>
        </>
      ) : (
        <form action={requestAction} className="space-y-4">
          <Field id="email" label="ایمیل" hint={EMAIL_HINT} error={emailError}>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              dir="ltr"
              required
              defaultValue={requestState.email}
              placeholder="name@example.com"
              aria-invalid={emailError ? true : undefined}
              aria-describedby={describedBy("email", EMAIL_HINT, emailError)}
              className={inputStyles}
            />
          </Field>

          <SubmitButton
            size="lg"
            className="w-full"
            pendingLabel="در حال ارسال کد…"
            disabled={!configured}
          >
            دریافت کد ورود
          </SubmitButton>

          {sendMessage ? (
            <p role="alert" className="text-xs leading-6 text-accent-strong">
              {sendMessage}
            </p>
          ) : null}
        </form>
      )}
    </Card>
  );
}

function ResendForm({
  email,
  action,
  disabled,
}: {
  email: string;
  action: (payload: FormData) => void;
  disabled: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <SubmitButton
        variant="ghost"
        size="sm"
        pendingLabel="در حال ارسال…"
        disabled={secondsLeft > 0 || disabled}
      >
        {secondsLeft > 0
          ? `ارسال دوباره تا ${formatNumber(secondsLeft)} ثانیه`
          : "ارسال دوباره کد"}
      </SubmitButton>
    </form>
  );
}
