"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { UserIcon } from "@/components/ui/icons";

/**
 * Account menu in the header. Built on a controlled <details>-like state so it
 * closes on outside click and Escape, instead of relying on native <details>
 * toggle behaviour which has no outside-click handling.
 */
export function UserMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface text-navy transition-colors hover:bg-canvas focus-visible:outline-2 [&::-webkit-details-marker]:hidden"
      >
        <UserIcon className="size-5" />
        <span className="sr-only">منوی حساب کاربری</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-2 w-60 rounded-2xl border border-line bg-surface p-2 shadow-[0_12px_32px_rgba(16,24,40,0.12)]"
        >
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
      ) : null}
    </div>
  );
}
