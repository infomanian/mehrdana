import type { Metadata } from "next";
import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SwitchSubmit } from "@/components/ui/SwitchSubmit";
import { requireSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { roleLabels } from "@/lib/labels";
import type { Json } from "@/types/database";

import { AvatarEditor } from "./AvatarEditor";
import { ProfileForm, type ProfileFormValues } from "./ProfileForm";
import { TicketsTable, type TicketHistoryRow } from "./TicketsTable";
import { setProfileVisibility } from "./actions";

export const metadata: Metadata = {
  title: "پروفایل من",
  description: "ویرایش پروفایل، تنظیم حریم خصوصی و مشاهده بلیت‌ها و پرداخت‌ها.",
  robots: { index: false, follow: false },
};

type TabId = "account" | "payments";

const tabs: { id: TabId; label: string; href: string }[] = [
  { id: "account", label: "حساب کاربری", href: "/profile" },
  { id: "payments", label: "بلیت‌ها و پرداخت‌ها", href: "/profile?tab=payments" },
];

function readSocialLink(links: Json, key: string): string {
  if (!links || typeof links !== "object" || Array.isArray(links)) return "";
  const value = (links as Record<string, Json | undefined>)[key];
  return typeof value === "string" ? value : "";
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const params = await searchParams;
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const activeTab: TabId = tabParam === "payments" ? "payments" : "account";

  const { supabase, user } = await requireSession("/profile");

  // The tab-specific request starts immediately and runs in parallel with the
  // profile lookup, so the page never makes more than two round trips.
  const ticketsPromise =
    activeTab === "payments"
      ? supabase.rpc("get_my_ticket_history")
      : Promise.resolve({ data: [] as TicketHistoryRow[], error: null });

  const categoriesPromise =
    activeTab === "account"
      ? supabase.from("categories").select("name, slug").order("name")
      : Promise.resolve({ data: [] as { name: string; slug: string }[], error: null });

  const [profileResult, ticketsResult, categoriesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, bio, profession, interests, social_links, role, is_public, created_at",
      )
      .eq("id", user.id)
      .maybeSingle(),
    ticketsPromise,
    categoriesPromise,
  ]);

  if (profileResult.error) throw new Error("profile-unavailable");

  const profile = profileResult.data;
  if (!profile) return <MissingProfile />;

  const formValues: ProfileFormValues = {
    fullName: profile.full_name ?? "",
    profession: profile.profession ?? "",
    bio: profile.bio ?? "",
    interests: profile.interests ?? [],
    instagram: readSocialLink(profile.social_links, "instagram"),
    linkedin: readSocialLink(profile.social_links, "linkedin"),
    telegram: readSocialLink(profile.social_links, "telegram"),
    website: readSocialLink(profile.social_links, "website"),
  };

  const categories = (categoriesResult.data ?? []).map((category) => category.name);
  const tickets = ticketsResult.data ?? [];

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy sm:text-3xl">پروفایل من</h1>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                اطلاعات عمومی، حریم خصوصی و سابقه بلیت‌های خود را از اینجا مدیریت کنید.
              </p>
            </div>

            {profile.role === "admin" ? (
              <ButtonLink href="/admin/events" variant="outline" size="sm">
                مدیریت رویدادها
              </ButtonLink>
            ) : null}
          </div>

          {!profile.full_name ? (
            <p className="mt-4 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3 text-xs leading-6 text-accent-strong">
              پروفایل شما کامل نیست. با وارد کردن نام و تخصص، در فهرست شرکت‌کنندگان رویدادها
              بهتر دیده می‌شوید.
            </p>
          ) : null}

          <Card className="mt-5 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <AvatarEditor
                  userId={user.id}
                  avatarUrl={profile.avatar_url}
                  name={profile.full_name}
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-bold text-navy">
                      {profile.full_name ?? "کاربر مهر دانا"}
                    </h2>
                    <Badge tone="gold">{roleLabels[profile.role]}</Badge>
                    {!profile.is_public ? <Badge>پروفایل مخفی</Badge> : null}
                  </div>

                  {user.email ? (
                    <p
                      dir="ltr"
                      title={user.email}
                      className="mt-1 truncate text-start text-xs text-ink-muted"
                    >
                      {user.email}
                    </p>
                  ) : null}

                  <p className="mt-1 text-xs text-ink-muted">
                    عضو از {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-canvas/60 px-5 py-4 sm:px-6">
              <div className="max-w-md">
                <p className="text-sm font-medium text-navy">
                  نمایش پروفایل در فهرست شرکت‌کنندگان
                </p>
                <p className="mt-0.5 text-xs leading-6 text-ink-muted">
                  {profile.is_public
                    ? "همه شرکت‌کنندگان می‌توانند نام، تخصص و علاقه‌مندی‌های شما را ببینند."
                    : "پروفایل شما در فهرست‌ها دیده نمی‌شود. بلیت‌ها و دسترسی‌های شما تغییری نمی‌کند."}
                </p>
              </div>

              <form action={setProfileVisibility}>
                <input type="hidden" name="is_public" value={String(!profile.is_public)} />
                <SwitchSubmit
                  checked={profile.is_public}
                  label="نمایش پروفایل در فهرست شرکت‌کنندگان"
                />
              </form>
            </div>
          </Card>

          <nav
            aria-label="بخش‌های پروفایل"
            className="mt-5 flex gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "flex-1 whitespace-nowrap rounded-full bg-navy px-4 py-2 text-center text-sm font-medium text-white"
                      : "flex-1 whitespace-nowrap rounded-full px-4 py-2 text-center text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-navy"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5">
            {activeTab === "account" ? (
              <div className="space-y-5">
                <ProfileForm initial={formValues} categories={categories} />

                <Card className="p-5">
                  <h2 className="text-sm font-bold text-navy">حریم خصوصی و حساب</h2>
                  <p className="mt-1 text-xs leading-6 text-ink-muted">
                    برای خروج از حساب روی دکمه زیر بزنید. با خروج، نشست این دستگاه بسته
                    می‌شود و برای ورود دوباره به کد ایمیل نیاز دارید.
                  </p>
                  <form action={signOutAction} className="mt-3">
                    <Button type="submit" variant="outline" size="sm">
                      خروج از حساب
                    </Button>
                  </form>
                </Card>
              </div>
            ) : (
              <>
                {ticketsResult.error ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3 text-xs leading-6 text-accent-strong"
                  >
                    لیست بلیت‌ها در دسترس نیست. اگر این پیام تکرار شد، به پشتیبانی اطلاع
                    دهید.
                  </p>
                ) : (
                  <TicketsTable tickets={tickets} />
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Shown when the profile row is missing (e.g. auth trigger was never installed). */
function MissingProfile() {
  return (
    <section className="py-12">
      <Container>
        <Card className="mx-auto max-w-md p-8 text-center">
          <h1 className="text-lg font-bold text-navy">پروفایل شما پیدا نشد</h1>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            حساب شما ساخته شده است اما اطلاعات پروفایل در دسترس نیست. یک‌بار از حساب خارج
            شوید و دوباره وارد شوید. اگر مشکل ادامه داشت به پشتیبانی اطلاع دهید.
          </p>
          <form action={signOutAction} className="mt-4">
            <Button type="submit" variant="outline" size="sm">
              خروج از حساب
            </Button>
          </form>
        </Card>
      </Container>
    </section>
  );
}
