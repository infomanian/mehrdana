import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { formatYear } from "@/lib/format";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { label: "رویدادها", href: "/events" },
  { label: "درباره باشگاه", href: "/#about" },
  { label: "ورود / ثبت‌نام", href: "/login" },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-cream">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr] sm:gap-12">
          <div>
            <p className="font-display text-3xl leading-none font-medium sm:text-4xl">
              {siteConfig.name}
            </p>
            <p className="mt-4 max-w-md text-sm leading-8 text-cream/65">{siteConfig.description}</p>
          </div>

          <nav aria-label="ناوبری پایین صفحه" className="sm:justify-self-end">
            <p className="text-[11px] text-cream/60">دسترسی سریع</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream/75 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/15 pt-5 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {formatYear()} {siteConfig.name} — همه حقوق محفوظ است.
          </span>
          <span>رویدادهای حضوری و آنلاین · گفتگوی زنده · شبکه‌سازی</span>
        </div>
      </Container>
    </footer>
  );
}
