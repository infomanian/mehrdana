import type { Metadata } from "next";
import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { inputStyles } from "@/components/ui/Field";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { roleLabels } from "@/lib/labels";
import type { UserRole } from "@/types/database";

import { BanButton } from "./BanButton";

export const metadata: Metadata = {
  title: "کاربران",
  robots: { index: false, follow: false },
};

type UserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || "";

  const { supabase } = await requireAdmin("/admin/users");

  let builder = supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, is_banned, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (query) {
    builder = builder.ilike("full_name", `%${query}%`);
  }

  const { data, error } = await builder;
  if (error) throw new Error("admin-users-unavailable");

  const users = (data ?? []) as unknown as UserRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">کاربران</h1>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        جستجوی کاربران و مدیریت مسدودسازی کامل (بن).
      </p>

      <form action="/admin/users" method="GET" className="mt-4 flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="جستجوی نام…"
          aria-label="جستجوی کاربر"
          className={inputStyles}
        />
        <button
          type="submit"
          className="rounded-full bg-navy px-5 text-sm font-medium text-white hover:bg-navy"
        >
          جستجو
        </button>
      </form>

      {users.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <h2 className="text-base font-bold text-navy">کاربری پیدا نشد</h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">عبارت دیگری را جستجو کنید.</p>
        </Card>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <ul className="divide-y divide-line">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <Avatar
                    src={user.avatar_url}
                    name={user.full_name}
                    className="size-9 shrink-0 text-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-navy transition-colors hover:text-teal-strong">
                        {user.full_name ?? "کاربر مهر دانا"}
                      </p>
                      <Badge tone="gold">{roleLabels[user.role]}</Badge>
                      {user.is_banned ? (
                        <Badge className="bg-red-50 text-red-700">بن‌شده</Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      عضویت از {formatDate(user.created_at)}
                    </p>
                  </div>
                </Link>

                <BanButton userId={user.id} banned={user.is_banned} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
