import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/icons";
import { formatYear } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-4 bg-navy-900 text-white">
      <Container className="py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <BrandMark className="size-9 shrink-0 text-navy-700" />
              <span className="text-base font-bold">{siteConfig.name}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/70">{siteConfig.description}</p>
          </div>

          <div className="text-sm text-white/60">
            <p>رویدادهای حضوری و آنلاین</p>
            <p className="mt-1">گفتگوی زنده و شبکه‌سازی</p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/50">
          © {formatYear()} {siteConfig.name} — همه حقوق محفوظ است.
        </div>
      </Container>
    </footer>
  );
}
