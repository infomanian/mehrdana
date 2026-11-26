"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getServerClient } from "@/lib/supabase/server";
import {
  SESSION_MODE_COOKIE,
  sessionModeCookieOptions,
} from "@/lib/supabase/session-mode";
import {
  normalizeEmail,
  normalizeOtp,
  safeNextPath,
  validateEmail,
  validateOtp,
} from "@/lib/validation";

import { SERVICE_UNAVAILABLE_MESSAGE, type LoginState } from "./state";

type AuthFailure = { code?: string; status?: number };

/**
 * Sends a one-time code by email.
 *
 * The response is intentionally identical for new and existing addresses: the
 * caller must not be able to discover whether an account exists.
 */
export async function requestEmailCode(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(formData.get("email"));
  const emailError = validateEmail(email);
  if (emailError) return { step: "email", email, emailError, remember: formData.get("remember") === "1" };

  const supabase = await getServerClient();
  if (!supabase) {
    return {
      step: "email",
      email,
      message: SERVICE_UNAVAILABLE_MESSAGE,
      remember: formData.get("remember") === "1",
    };
  }

  const remember = formData.get("remember") === "1";
  let message: string | null = null;

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) message = sendErrorMessage(error);
  } catch {
    message = SERVICE_UNAVAILABLE_MESSAGE;
  }

  if (message) return { step: "email", email, message, remember };

  // `sentAt` only tells the client to restart its countdown.
  return { step: "code", email, sentAt: Date.now(), remember };
}

/** Verifies the code and starts the session. */
export async function verifyEmailCode(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(formData.get("email"));
  const token = normalizeOtp(formData.get("token"));
  const nextPath = safeNextPath(formData.get("next"));
  const remember = formData.get("remember") === "1";

  // Echoed back so the form can hide an error that belongs to an older code
  // after the user asked for a fresh one.
  const sentAtValue = Number(formData.get("sentAt"));
  const sentAt = Number.isFinite(sentAtValue) && sentAtValue > 0 ? sentAtValue : undefined;

  const emailError = validateEmail(email);
  if (emailError) return { step: "email", email, emailError, remember };

  const codeError = validateOtp(token);
  if (codeError) return { step: "code", email, codeError, sentAt, remember };

  // Persist the "remember me" choice so the proxy keeps applying it whenever it
  // rotates the refresh token, then create the session with the matching
  // cookie lifetime.
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_MODE_COOKIE,
    remember ? "persistent" : "session",
    { ...sessionModeCookieOptions },
  );

  const supabase = await getServerClient(remember ? "persistent" : "session");
  if (!supabase) {
    return { step: "code", email, message: SERVICE_UNAVAILABLE_MESSAGE, sentAt, remember };
  }

  let failure: string | null = null;

  try {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) failure = verifyErrorMessage(error);
  } catch {
    failure = SERVICE_UNAVAILABLE_MESSAGE;
  }

  if (failure) return { step: "code", email, codeError: failure, sentAt, remember };

  // Outside the try/catch: redirect() throws a control-flow exception that must
  // reach the framework untouched.
  redirect(nextPath);
}

function sendErrorMessage(error: AuthFailure): string {
  if (error.status === 429 || error.code?.includes("rate_limit")) {
    return "درخواست‌های زیادی ثبت شده است. حدود یک دقیقه صبر کنید و دوباره تلاش کنید.";
  }
  if (error.code === "email_address_invalid" || error.code === "validation_failed") {
    return "این ایمیل پذیرفته نشد. یک ایمیل معتبر وارد کنید.";
  }
  return "ارسال کد انجام نشد. چند لحظه بعد دوباره تلاش کنید.";
}

function verifyErrorMessage(error: AuthFailure): string {
  if (error.code === "otp_expired") {
    return "کد منقضی شده است. یک کد تازه بگیرید.";
  }
  if (error.status === 429 || error.code?.includes("rate_limit")) {
    return "تلاش‌های زیادی انجام شده است. کمی بعد دوباره تلاش کنید.";
  }
  return "کد وارد‌شده درست نیست یا منقضی شده است.";
}
