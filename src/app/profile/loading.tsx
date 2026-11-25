import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

/** Skeleton shown while the profile request is in flight. */
export default function ProfileLoading() {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto w-full max-w-4xl">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-charcoal/8" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-charcoal/8" />

          <Card className="mt-5 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="size-20 shrink-0 animate-pulse rounded-full bg-charcoal/8" />
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-charcoal/8" />
                <div className="h-3 w-52 animate-pulse rounded bg-charcoal/8" />
                <div className="h-3 w-28 animate-pulse rounded bg-charcoal/8" />
              </div>
            </div>
            <div className="mt-6 h-11 w-full animate-pulse rounded-xl bg-charcoal/8" />
            <div className="mt-3 h-11 w-2/3 animate-pulse rounded-xl bg-charcoal/8" />
          </Card>

          <div className="mt-5 h-11 w-full animate-pulse rounded-full bg-charcoal/8" />
          <Card className="mt-5 space-y-3 p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-charcoal/8" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-charcoal/8" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-charcoal/8" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-charcoal/8" />
          </Card>
        </div>
      </Container>
    </section>
  );
}
