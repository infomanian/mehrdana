import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { roleLabels } from "@/lib/labels";
import { getAdminUserEmail } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/validation";
import type { Json, UserRole } from "@/types/database";

import { RoleForm } from "./RoleForm";

export const metadata: Metadata = {
  title: "کاربر",
  robots: { index: false, follow: false },
};

type UserDetailRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  profession: string | null;
  interests: string[] | null;
  social_links: Json;
  role: UserRole;
  is_public: boolean;
  is_banned: boolean;
  banned_at: string | null;
  created_at: string;
};

const SOCIAL_FIELDS = [
  { key: "instagram", label: "اینستاگرام" },
  { key: "linkedin", label: "لینکدین" },
  { key: "telegram", label: "تلگرام" },
  { key: "website", label: "وب‌سایت" },
] as const;

function readSocialLink(links: Json, key: string): string {
  if (!links || typeof links !== "object" || Array.isArray(links)) return "";
  const value = (links as Record<string, Json | undefined>)[key];
  return typeof value === "string" ? value : "";
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { supabase, user } = await requireAdmin(`/admin/users/${id}`);

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, bio, profession, interests, social_links, role, is_public, is_banned, banned_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("admin-user-unavailable");
  if (!data) notFound();

  const profile = data as unknown as UserDetailRow;
  const email = await getAdminUserEmail(id);
  const isSelf = profile.id === user.id;

  const socialRows = SOCIAL_FIELDS.map((field) => ({
    ...field,
    value: readSocialLink(profile.social_links, field.key),
  })).filter((field) => field.value);

  return (
    <div>
      <Link href="/admin/users" className="text-sm font-medium text-navy hover:underline">
        ← بازگشت به کاربران
      </Link>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            className="size-16 shrink-0 text-xl sm:size-20 sm:text-2xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-navy">
              {profile.full_name ?? "کاربر مهر دانا"}
            </h1>
            {email ? (
              <p dir="ltr" className="mt-1 truncate text-start text-sm text-ink-muted">
                {email}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="gold">{roleLabels[profile.role]}</Badge>
              {profile.is_banned ? (
                <Badge className="bg-red-50 text-red-700">بن‌شده</Badge>
              ) : null}
              {!profile.is_public ? <Badge>پروفایل مخفی</Badge> : null}
            </div>
          </div>
        </div>

        <div className="border-t border-line px-5 py-4 sm:px-6">
          <h2 className="text-sm font-bold text-navy">سطح دسترسی</h2>
          <p className="mt-0.5 text-xs leading-6 text-ink-muted">
            {isSelf
              ? "نمی‌توانید سطح دسترسی خودتان را تغییر دهید."
              : "نقش کاربر را انتخاب کنید و ذخیره بزنید. ارتقا به مدیر، دسترسی کامل پنل را می‌دهد."}
          </p>
          <div className="mt-3">
            <RoleForm userId={profile.id} currentRole={profile.role} disabled={isSelf} />
          </div>
        </div>

        <div className="border-t border-line px-5 py-4 sm:px-6">
          <h2 className="text-sm font-bold text-navy">اطلاعات پروفایل</h2>
          <div className="mt-3 space-y-2.5 text-sm">
            <DetailRow label="تخصص">{profile.profession}</DetailRow>
            <DetailRow label="درباره">{profile.bio}</DetailRow>
            <DetailRow label="تاریخ عضویت">{formatDateTime(profile.created_at)}</DetailRow>
            {profile.is_banned && profile.banned_at ? (
              <DetailRow label="تاریخ مسدودسازی">{formatDateTime(profile.banned_at)}</DetailRow>
            ) : null}
          </div>

          {profile.interests && profile.interests.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-muted">علاقه‌مندی‌ها</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.interests.map((interest) => (
                  <Badge key={interest}>{interest}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          {socialRows.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-muted">شبکه‌های اجتماعی</p>
              <div className="mt-2 space-y-2 text-sm">
                {socialRows.map((row) => (
                  <DetailRow key={row.key} label={row.label}>
                    <span dir="auto">{row.value}</span>
                  </DetailRow>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="flex gap-3">
      <span className="w-28 shrink-0 text-ink-muted">{label}</span>
      <span className="min-w-0 whitespace-pre-wrap break-words text-ink">{children}</span>
    </div>
  );
}
