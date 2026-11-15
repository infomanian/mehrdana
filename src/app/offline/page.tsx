import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OfflineIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "حالت آفلاین",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <Container size="narrow" className="py-20 text-center sm:py-28">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-navy-800/8 text-navy-800">
        <OfflineIcon className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-navy-900 sm:text-3xl">اتصال اینترنت برقرار نیست</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-muted">
        این صفحه را می‌توانید آفلاین ببینید، اما برای دیدن رویدادها و گفتگو باید دوباره آنلاین
        شوید.
      </p>
      <ButtonLink href="/" className="mt-8">
        تلاش دوباره
      </ButtonLink>
    </Container>
  );
}
