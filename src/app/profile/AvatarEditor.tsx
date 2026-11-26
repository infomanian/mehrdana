"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

import { saveAvatarPath } from "./actions";
import { Avatar } from "@/components/ui/Avatar";
import { PencilIcon } from "@/components/ui/icons";
import { getBrowserClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function extensionFor(type: string): "jpg" | "png" | "webp" {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/**
 * The profile picture doubles as the upload control: clicking it opens the file
 * picker and the picture is replaced in place, so there is no separate upload
 * box. Uploads go straight from the browser to the `avatars` bucket; storage
 * rules only allow writes inside `avatars/<own-user-id>/`, so the upload cannot
 * overwrite somebody else's picture. The server action then stores the URL.
 */
export function AvatarEditor({
  userId,
  avatarUrl,
  name,
}: {
  userId: string;
  avatarUrl: string | null;
  name: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Release the temporary object URL whenever the preview changes or unmounts.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Success messages fade away on their own; errors stay until the next attempt.
  useEffect(() => {
    if (!message || failed || busy) return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message, failed, busy]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setFailed(false);

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      setMessage("فقط تصویر JPG، PNG یا WebP مجاز است.");
      setFailed(true);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_BYTES) {
      setMessage("حجم تصویر باید کمتر از ۲ مگابایت باشد.");
      setFailed(true);
      event.target.value = "";
      return;
    }

    setBusy(true);
    setPreview(URL.createObjectURL(file));

    try {
      const supabase = getBrowserClient();
      if (!supabase) throw new Error("supabase-not-configured");

      const path = `${userId}/avatar.${extensionFor(file.type)}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });
      if (error) throw error;

      const result = await saveAvatarPath(path);
      if (!result.ok) throw new Error(result.message ?? "save-failed");

      setMessage("تصویر پروفایل به‌روز شد.");
      router.refresh();
    } catch {
      setPreview(null);
      setFailed(true);
      setMessage("ارسال تصویر انجام نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="تغییر تصویر پروفایل"
        title="تغییر تصویر پروفایل"
        className="group relative block size-16 overflow-hidden rounded-full sm:size-20"
      >
        {preview ? (
          // A blob: URL cannot go through next/image, it is only a local preview.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="پیش‌نمایش تصویر پروفایل"
            className="size-full object-cover"
          />
        ) : (
          <Avatar src={avatarUrl} name={name} className="size-full text-xl sm:text-2xl" />
        )}

        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-navy/60 px-2 text-center text-[10px] leading-4 font-medium text-white ${
            busy
              ? "opacity-100"
              : "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          {busy ? "در حال ارسال…" : "تغییر تصویر"}
        </span>
      </button>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-0 bottom-0 z-10 flex size-6 items-center justify-center rounded-full border-2 border-surface bg-navy text-cream shadow-sm"
      >
        <PencilIcon className="size-3" />
      </span>

      <input
        ref={inputRef}
        id="avatar-file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={busy}
        onChange={handleFile}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <p
        role="status"
        aria-live="polite"
        className={
          message
            ? `fixed bottom-20 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-xs text-white shadow-lg sm:bottom-6 ${
                failed ? "bg-accent" : "bg-navy"
              }`
            : "sr-only"
        }
      >
        {message ?? ""}
      </p>
    </div>
  );
}
