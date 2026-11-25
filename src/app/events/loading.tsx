import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export default function EventsLoading() {
  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
          <div className="h-10 flex-1 animate-pulse rounded-full bg-navy/8 sm:max-w-40" />
          <div className="h-10 flex-1 animate-pulse rounded-full bg-navy/8 sm:max-w-40" />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-[16/9] animate-pulse bg-navy/8" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-24 animate-pulse rounded-full bg-navy/8" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-navy/8" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-navy/8" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-navy/8" />
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
