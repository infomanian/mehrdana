import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container size="narrow" className="py-20 text-center sm:py-28">
      <p className="text-[11px] text-ink-muted">خطای ۴۰۴</p>
      <h1 className="mt-4 font-display text-3xl font-medium text-navy sm:text-4xl">این صفحه پیدا نشد</h1>
      <p className="mt-3 text-sm leading-8 text-ink-muted">
        ممکن است نشانی را اشتباه وارد کرده باشید یا صفحه جابه‌جا شده باشد.
      </p>
      <ButtonLink href="/" className="mt-8">
        بازگشت به صفحه اصلی
      </ButtonLink>
    </Container>
  );
}
