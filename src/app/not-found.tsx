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
      <p className="text-sm font-medium text-accent-strong">خطای ۴۰۴</p>
      <h1 className="mt-3 text-2xl font-bold text-navy-900 sm:text-3xl">این صفحه پیدا نشد</h1>
      <p className="mt-3 text-sm leading-8 text-ink-muted">
        ممکن است نشانی را اشتباه وارد کرده باشید یا صفحه جابه‌جا شده باشد.
      </p>
      <ButtonLink href="/" className="mt-8">
        بازگشت به صفحه اصلی
      </ButtonLink>
    </Container>
  );
}
