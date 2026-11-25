import { Container } from "@/components/ui/Container";

export default function EventDetailLoading() {
  return (
    <section className="border-b border-rule bg-cream-deep">
      <Container className="py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
          <div className="aspect-[16/9] animate-pulse rounded-xl bg-navy/10" />
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-full bg-navy/10" />
            <div className="h-8 w-4/5 animate-pulse rounded-sm bg-navy/10" />
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-navy/10" />
            <div className="h-4 w-1/2 animate-pulse rounded-sm bg-navy/10" />
          </div>
        </div>
      </Container>
    </section>
  );
}
