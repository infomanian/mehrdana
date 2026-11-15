import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CalendarIcon, ChatIcon, UsersIcon } from "@/components/ui/icons";

const features = [
  {
    icon: CalendarIcon,
    title: "حضوری یا آنلاین، انتخاب با تو",
    body: "هر رویداد هم جای فیزیکی دارد و هم پخش زنده؛ بلیت هر کدام جداگانه و شفاف است.",
  },
  {
    icon: ChatIcon,
    title: "اتاق گفتگو، قبل و بعد از رویداد",
    body: "فقط دارندگان بلیت تأییدشده وارد اتاق می‌شوند؛ فضایی امن با امکان گزارش و مسدودسازی.",
  },
  {
    icon: UsersIcon,
    title: "آدم‌های هم‌مسیر",
    body: "شرکت‌کنندگان را بر اساس علاقه پیدا کن، درخواست دوستی بده و خصوصی گفتگو کن.",
  },
];

const categories = [
  { name: "روان‌شناسی", slug: "psychology" },
  { name: "فلسفه", slug: "philosophy" },
  { name: "بیزنس", slug: "business" },
  { name: "نوروساینس", slug: "neuroscience" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -start-24 size-72 rounded-full bg-accent-soft/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 end-0 size-80 rounded-full bg-verified/20 blur-3xl"
        />

        <Container className="relative py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <Badge tone="onDark">رویداد · گفتگو · شبکه‌سازی</Badge>

            <h1 className="mt-5 text-3xl font-bold leading-[1.4] sm:text-4xl sm:leading-[1.35] lg:text-5xl">
              در رویدادها شرکت کن، با آدم‌های هم‌مسیر آشنا شو
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/80 sm:text-base sm:leading-8">
              مهر دانا بستری فارسی برای رویدادهای حضوری و آنلاین روان‌شناسی، فلسفه، بیزنس و
              نوروساینس است؛ همراه با اتاق گفتگوی زنده و فرصت آشنایی با شرکت‌کنندگان.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/events" size="lg">
                دیدن رویدادها
              </ButtonLink>
              <Link
                href="#features"
                className="text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                آشنایی با مهر دانا
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-surface py-4">
        <Container>
          <ul className="flex flex-wrap items-center gap-2">
            <li className="text-xs text-ink-muted">دسته‌بندی‌ها:</li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/events?category=${category.slug}`}>
                  <Badge tone="navy">{category.name}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="features" className="scroll-mt-20 py-14 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-navy-900 sm:text-3xl">چرا مهر دانا؟</h2>
            <p className="mt-3 text-sm leading-8 text-ink-muted sm:text-base">
              بستری که رویداد و ارتباط انسانی را کنار هم می‌گذارد: یاد می‌گیری، گفتگو می‌کنی و
              آدم‌های تازه‌ای پیدا می‌کنی.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy-800/8 text-navy-800">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-muted">{body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center sm:px-10">
            <Badge tone="verified">ویترین رویدادها</Badge>
            <h2 className="mt-4 text-xl font-bold text-navy-900 sm:text-2xl">
              رویدادهای حضوری و آنلاین را ببینید
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-ink-muted">
              در فهرست رویدادها، بر اساس دسته‌بندی و وضعیت جستجو کنید و بلیت رویداد
              موردعلاقه خود را تهیه کنید.
            </p>
            <ButtonLink href="/events" variant="navy" className="mt-6">
              مشاهده رویدادها
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
