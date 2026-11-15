import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { UserIcon } from "@/components/ui/icons";

/**
 * Zero-JavaScript account menu built on <details>.
 * Deliberately shows no name or avatar: the header renders on every page and a
 * profile lookup here would add a database query to every request.
 */
export function UserMenu({ email }: { email: string | null }) {
  return (
    <details className="group relative">
      <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface text-navy-800 transition-colors hover:bg-canvas focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
        <UserIcon className="size-5" />
        <span className="sr-only">منوی حساب کاربری</span>
      </summary>

      <div className="absolute end-0 z-50 mt-2 w-60 rounded-2xl border border-line bg-surface p-2 shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
        {email ? (
          <p
            dir="ltr"
            className="truncate px-3 pb-2 pt-1 text-start text-xs text-ink-muted"
            title={email}
          >
            {email}
          </p>
        ) : null}

        <Link
          href="/profile"
          className="block rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas"
        >
          پروفایل من
        </Link>

        <Link
          href="/messages"
          className="block rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas"
        >
          پیام‌ها و ارتباطات
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-start text-sm text-accent-strong transition-colors hover:bg-accent/8"
          >
            خروج از حساب
          </button>
        </form>
      </div>
    </details>
  );
}
