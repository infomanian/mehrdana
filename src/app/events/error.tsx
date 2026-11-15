"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export default function EventsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="py-12">
      <Container>
        <Card className="mx-auto max-w-md p-8 text-center">
          <h1 className="text-lg font-bold text-navy-900">بارگذاری رویدادها انجام نشد</h1>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            ارتباط با سرور برقرار نشد یا اطلاعات در دسترس نبود. یک‌بار دیگر تلاش کنید.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={reset}>
              تلاش دوباره
            </Button>
            <Link href="/" className="text-sm font-medium text-navy-800 hover:underline">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </Card>
      </Container>
    </section>
  );
}
