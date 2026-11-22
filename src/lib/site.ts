/**
 * Single source of truth for brand copy and navigation.
 * Change the brand here once and it propagates to the header, footer,
 * PWA manifest and metadata.
 */
export const siteConfig = {
  name: "مهر دانا",
  nameEn: "MehrDana",
  tagline: "رویداد، گفتگو و شبکه‌سازی",
  description:
    "مهر دانا بستری فارسی برای رویدادهای حضوری و آنلاین روان‌شناسی، فلسفه، بیزنس و نوروساینس است؛ همراه با اتاق گفتگوی زنده و آشنایی با شرکت‌کنندگان.",
  locale: "fa-IR",
} as const;

export type NavItem = {
  id: string;
  label: string;
  /** Route is created in a later phase. Rendered as "coming soon" until then. */
  href: string | null;
};

export const headerNav: NavItem[] = [
  { id: "events", label: "رویدادها", href: "/events" },
  { id: "about", label: "درباره مهر دانا", href: "/#about" },
];

export const mobileTabNav: NavItem[] = [
  { id: "events", label: "رویدادها", href: "/events" },
  { id: "my-events", label: "رویدادهای من", href: null },
  { id: "messages", label: "پیام‌ها", href: "/messages" },
  { id: "profile", label: "پروفایل", href: "/profile" },
];
