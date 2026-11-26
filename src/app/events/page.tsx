import type { Metadata } from "next";

import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { OfflineIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { isSupabaseConfigured } from "@/lib/env";
import { listCategories, listEvents } from "@/lib/events";
import { getServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "رویدادها",
  description:
    "رویدادهای حضوری و آنلاین مهر دانا در زمینه روان‌شناسی، فلسفه، بیزنس و نوروساینس.",
};

type ListStatus = "upcoming" | "past";

function listHref(status: ListStatus, category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (status === "past") params.set("status", "past");
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; category?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;

  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;

  const status: ListStatus = statusParam === "past" ? "past" : "upcoming";
  const category = categoryParam?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const configured = isSupabaseConfigured;

  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let items: Awaited<ReturnType<typeof listEvents>>["items"] = [];
  let hasNext = false;
  let loadError = false;

  if (configured) {
    const supabase = await getServerClient();
    if (supabase) {
      try {
        const [categoryResult, eventResult] = await Promise.all([
          listCategories(),
          listEvents(supabase, { status, categorySlug: category, page }),
        ]);
        categories = categoryResult;
        items = eventResult.items;
        hasNext = eventResult.hasNext;
      } catch {
        loadError = true;
      }
    }
  }

  const categoryKnown = category ? categories.some((c) => c.slug === category) : true;

  return (
    <>
      <PageHeader
        eyebrow="ویترین رویدادها"
        title="رویدادهای مهر دانا"
        description="رویدادهای حضوری و آنلاین را ببینید، بلیت بگیرید و با آدم‌های هم‌مسیر آشنا شوید."
      />

      <section className="py-10 sm:py-14">
        <Container>
          {!configured || loadError ? (
            <Card className="mx-auto max-w-lg p-8 text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-sand/70 text-navy">
                <OfflineIcon className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-lg font-medium text-navy">
                فهرست رویدادها در دسترس نیست
              </h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                اتصال به پایگاه داده برقرار نیست. چند لحظه بعد دوباره تلاش کنید.
              </p>
            </Card>
          ) : (
            <>
              <EventFilters
                activeStatus={status}
                activeCategory={category}
                categories={categories}
              />

              {items.length === 0 ? (
                <Card className="mt-6 p-10 text-center">
                  <h2 className="font-display text-lg font-medium text-navy">
                    {category && !categoryKnown
                      ? "این دسته‌بندی وجود ندارد."
                      : status === "past"
                        ? "هنوز رویداد برگزارشده‌ای ثبت نشده است."
                        : "هنوز رویداد آینده‌ای ثبت نشده است."}
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-muted">
                    رویدادهای جدید به‌زودی به این صفحه اضافه می‌شوند.
                  </p>
                  <ButtonLink href="/events" variant="outline" size="sm" className="mt-4">
                    پاک کردن فیلترها
                  </ButtonLink>
                </Card>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {items.length > 0 && (page > 1 || hasNext) ? (
                <nav aria-label="صفحه‌بندی رویدادها" className="mt-8 flex items-center justify-between gap-3">
                  {page > 1 ? (
                    <ButtonLink
                      href={listHref(status, category, page - 1)}
                      variant="outline"
                      size="sm"
                    >
                      صفحه قبل
                    </ButtonLink>
                  ) : (
                    <span aria-hidden="true" />
                  )}

                  <span className="text-xs text-ink-muted">صفحه {page}</span>

                  {hasNext ? (
                    <ButtonLink href={listHref(status, category, page + 1)} variant="outline" size="sm">
                      صفحه بعد
                    </ButtonLink>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </nav>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
