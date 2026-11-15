export type LoginState = {
  /** Which step the form shows after the last Server Action finished. */
  step: "email" | "code";
  email: string;
  emailError?: string;
  codeError?: string;
  message?: string;
  /**
   * Server timestamp used only as a change signal on the client to restart the
   * 60-second resend countdown. Never rendered.
   */
  sentAt?: number;
};

export const initialLoginState: LoginState = { step: "email", email: "" };

export const SERVICE_UNAVAILABLE_MESSAGE =
  "سرویس ورود هنوز به سرور وصل نشده است. لطفاً بعداً تلاش کنید.";
