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
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-charcoal/8 text-charcoal">
        <OfflineIcon className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-medium text-charcoal sm:text-4xl">
        اتصال اینترنت برقرار نیست
      </h1>
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
