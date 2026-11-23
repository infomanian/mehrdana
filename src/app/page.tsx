import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

/** Section eyebrow: a hairline plus a small editorial label. */
function SectionLabel({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p
      className={
        tone === "light"
          ? "flex items-center gap-3 text-[11px] font-medium text-cream/60"
          : "flex items-center gap-3 text-[11px] font-medium text-ink-muted"
      }
    >
      <span
        aria-hidden="true"
        className={tone === "light" ? "h-px w-8 bg-cream/35" : "h-px w-8 bg-charcoal/35"}
      />
      {children}
    </p>
  );
}

const categories = [
  {
    name: "روان‌شناسی",
    slug: "psychology",
    note: "ذهن، رابطه، رفتار",
    src: "/images/home/category-psychology.jpg",
    alt: "دو نفر در حال گفتگو روی صندلی، با لیوان‌های چای و دفترچه یادداشت روی میز",
  },
  {
    name: "فلسفه",
    slug: "philosophy",
    note: "پرسش‌های بی‌پایان",
    src: "/images/home/category-philosophy.jpg",
    alt: "مردی در کتابخانه‌ای قدیمی کنار پنجره مشغول خواندن کتاب است",
  },
  {
    name: "بیزنس",
    slug: "business",
    note: "ساختن و رشد کردن",
    src: "/images/home/category-business.jpg",
    alt: "چند نفر دور میز جلسه در حال کار با لپ‌تاپ و یادداشت‌برداری هستند",
  },
  {
    name: "نوروساینس",
    slug: "neuroscience",
    note: "مغز و تجربه",
    src: "/images/home/category-neuroscience.jpg",
    alt: "تصویر هنری از سلول‌های عصبی با نور کهربایی",
  },
];

const offerings = [
  {
    number: "۰۱",
    title: "رویدادهای حضوری",
    body: "در یک فضای واقعی، با چای و گفت‌وگوی رو در رو. ظرفیت محدود است و بلیت هر نفر جداگانه ثبت می‌شود.",
  },
  {
    number: "۰۲",
    title: "رویدادهای آنلاین",
    body: "اگر شهرتان دور است، همان رویداد را زنده از خانه ببینید. بلیت آنلاین از بلیت حضوری جداست.",
  },
  {
    number: "۰۳",
    title: "اتاق گفتگوی رویداد",
    body: "اتاق گفتگو پیش و پس از رویداد باز است؛ فقط برای کسانی که بلیتشان تأیید شده است.",
  },
  {
    number: "۰۴",
    title: "شبکه‌سازی هدفمند",
    body: "شرکت‌کنندگان را بر اساس علاقه پیدا کنید، درخواست ارتباط بدهید و خصوصی گفتگو کنید.",
  },
];

const principles = [
  {
    number: "۰۱",
    title: "بلیت تأییدشده",
    body: "بدون بلیت تأییدشده هیچ‌کس به اتاق گفتگو یا لینک خصوصی رویداد دسترسی ندارد.",
  },
  {
    number: "۰۲",
    title: "حریم خصوصی",
    body: "پیام‌های خصوصی و لینک رویدادها محرمانه‌اند و پروفایل را می‌توانید خصوصی نگه دارید.",
  },
  {
    number: "۰۳",
    title: "گفتگوی محترمانه",
    body: "گزارش و مسدودسازی در دسترس است تا فضا برای همه امن و آرام بماند.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero ---------------------------------------------------------------- */}
      <section className="relative">
        <Container className="pt-10 pb-12 sm:pt-14 lg:pt-16">
          <div className="grid items-end gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-12">
            <div>
              <SectionLabel>باشگاه رویدادهای مهر دانا</SectionLabel>

              <h1 className="mt-7 font-display text-[clamp(2.7rem,6.6vw,5rem)] leading-[1.1] font-medium text-charcoal">
                دانش. گفت‌وگو.
                <br />
                پیوند.
              </h1>

              <div aria-hidden="true" className="mt-9 h-px w-full bg-charcoal/25" />

              <p className="mt-6 max-w-xl text-sm leading-8 text-ink-muted sm:text-base sm:leading-9">
                مهر دانا باشگاهی برای رویدادهای حضوری و آنلاین روان‌شناسی، فلسفه، بیزنس و
                نوروساینس است؛ جایی برای یاد گرفتن، پرسیدن و آشنا شدن با آدم‌هایی که مثل شما
                کنجکاوند.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/events" size="lg">
                  دیدن رویدادها
                </ButtonLink>
                <ButtonLink href="#about" variant="outline" size="lg">
                  درباره باشگاه
                </ButtonLink>
              </div>
            </div>

            <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal">
              <Image
                src="/images/home/hero.jpg"
                alt="چند نفر در کتابخانه‌ای با نور گرم، دور میزی چوبی و لیوان‌های چای در حال گفتگو هستند"
                fill
                priority
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-transparent"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <span className="font-display text-lg leading-tight text-cream sm:text-xl">
                  {siteConfig.name}
                </span>
                <span className="text-[11px] text-cream/70">تهران و آنلاین</span>
              </div>
            </div>
          </div>

          <ul className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-5 text-xs text-ink-muted sm:text-sm">
            <li className="text-[11px] text-ink-muted">حوزه‌ها</li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/events?category=${category.slug}`}
                  className="transition-colors hover:text-clay"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Statement ----------------------------------------------------------- */}
      <section id="about" className="scroll-mt-20 border-t border-rule">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-3">
              <SectionLabel>۰۱ — درباره باشگاه</SectionLabel>
            </div>

            <div className="lg:col-span-9">
              <h2 className="max-w-3xl font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.25] font-medium text-charcoal">
                یادگیری وقتی بهتر است که مشترک باشد.
              </h2>

              <div className="mt-7 grid gap-5 text-sm leading-8 text-ink-muted sm:grid-cols-2 sm:gap-8 sm:text-base sm:leading-9">
                <p>
                  هر رویداد یک اتاق است: چند نفر، یک موضوع، و وقتی برای فکر کردن با صدای
                  بلند. مهر دانا می‌خواهد همان اتاق را به شهر شما و به خانه‌ی شما بیاورد.
                </p>
                <p>
                  بعد از پایان رویداد گفت‌وگو تمام نمی‌شود. اتاق گفتگو باز می‌ماند و کسانی که
                  آن شب آنجا بودند می‌توانند مسیرشان را با هم ادامه بدهند.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Offerings ----------------------------------------------------------- */}
      <section className="bg-charcoal text-cream">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <SectionLabel tone="light">۰۲ — چه چیزی در مهر دانا هست</SectionLabel>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.3] font-medium">
                از یک شب گفت‌وگو تا یک شبکه‌ی انسانی.
              </h2>
            </div>

            <ul className="lg:col-span-8">
              {offerings.map((item) => (
                <li
                  key={item.number}
                  className="grid gap-2 border-t border-cream/15 py-6 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr] sm:gap-6"
                >
                  <span className="text-[11px] text-cream/65 sm:pt-2">{item.number}</span>
                  <div>
                    <h3 className="font-display text-xl leading-snug sm:text-2xl">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-8 text-cream/65">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Principles ---------------------------------------------------------- */}
      <section className="bg-sage text-charcoal">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>۰۳ — قواعد بازی</SectionLabel>
              <h2 className="mt-5 font-display text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.3] font-medium">
                سه چیزی که سر جایش می‌ماند.
              </h2>
            </div>
            <p className="max-w-xs text-xs leading-7 text-charcoal/70 sm:text-sm">
              بدون این سه، باشگاه فقط یک فهرست رویداد است.
            </p>
          </div>

          <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-0">
            {principles.map((item) => (
              <li
                key={item.number}
                className="border-t border-charcoal/20 pt-5 sm:border-t-0 sm:border-s sm:px-6 sm:pt-0 sm:first:border-s-0 sm:first:ps-0 sm:last:pe-0"
              >
                <span className="text-[11px] text-charcoal/65">{item.number}</span>
                <h3 className="mt-2 font-display text-xl leading-snug sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-charcoal/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Categories ---------------------------------------------------------- */}
      <section className="border-t border-rule">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>۰۴ — حوزه‌ها</SectionLabel>
              <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.25] font-medium text-charcoal">
                از کجا شروع کنید؟
              </h2>
            </div>
            <Link
              href="/events"
              className="text-sm text-ink-muted underline decoration-charcoal/25 underline-offset-4 transition-colors hover:text-clay hover:decoration-clay"
            >
              دیدن همه رویدادها
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {categories.map(({ name, slug, note, src, alt }) => (
              <li key={slug}>
                <Link href={`/events?category=${slug}`} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
                    <span className="font-display text-lg leading-snug text-charcoal transition-colors group-hover:text-clay sm:text-xl">
                      <span className="sr-only">دیدن رویدادهای </span>
                      {name}
                    </span>
                    <span className="text-[11px] text-ink-muted">{note}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Closing ------------------------------------------------------------- */}
      <section className="border-t border-rule bg-cream-deep">
        <Container className="py-16 text-center sm:py-20">
          <p className="text-[11px] text-ink-muted">۰۵ — قدم بعدی</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.25] font-medium text-charcoal">
            اولین قدم، یک رویداد است.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-ink-muted">
            رویدادهای پیشرو را ببینید؛ اگر هنوز چیزی ثبت نشده باشد، حساب بسازید تا خبر
            اولین رویداد به شما برسد.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/events" size="lg">
              دیدن رویدادها
            </ButtonLink>
            <ButtonLink href="/login" variant="outline" size="lg">
              ساخت حساب
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
