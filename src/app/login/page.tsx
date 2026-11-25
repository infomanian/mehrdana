import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/validation";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "ورود و ثبت‌نام",
  description: "ورود یا ثبت‌نام در مهر دانا با ایمیل و کد یک‌بارمصرف، بدون رمز عبور.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = safeNextPath(nextParam);

  // A valid session skips the form instead of asking for a second code.
  const user = await getSessionUser();
  if (user) redirect(nextPath);

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <div className="text-center">
          <Badge tone="verified">ورود امن بدون رمز عبور</Badge>
          <h1 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
            ورود یا ثبت‌نام
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-ink-muted">
            ایمیل خود را وارد کنید؛ یک کد ۶ رقمی برایتان می‌فرستیم. نه رمزی ذخیره می‌شود،
            نه نیازی به یادسپاری آن دارید.
          </p>
        </div>

        <div className="mt-7">
          <LoginForm nextPath={nextPath} configured={isSupabaseConfigured} />
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-ink-muted">
          با ورود، شرایط استفاده از مهر دانا را می‌پذیرید. اطلاعات شما فقط برای ساخت
          پروفایل و ارتباط با شرکت‌کنندگان استفاده می‌شود.
        </p>
      </div>
    </section>
  );
}
