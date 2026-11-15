import { Container } from "@/components/ui/Container";

export default function EventDetailLoading() {
  return (
    <section className="bg-navy-900">
      <Container className="py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="aspect-[16/9] animate-pulse rounded-2xl bg-white/10" />
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-full bg-white/15" />
            <div className="h-8 w-4/5 animate-pulse rounded bg-white/15" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/15" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-white/15" />
          </div>
        </div>
      </Container>
    </section>
  );
}
