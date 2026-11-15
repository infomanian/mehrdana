"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

import { saveAvatarPath } from "./actions";
import { Avatar } from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/Button";
import { getBrowserClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function extensionFor(type: string): "jpg" | "png" | "webp" {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Uploads straight from the browser to the `avatars` bucket. Storage rules
 * only allow writes inside `avatars/<own-user-id>/`, so the upload cannot
 * overwrite somebody else's picture. The server action then stores the URL.
 */
export function AvatarUploader({
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
    <div>
      <div className="flex items-center gap-4">
        <div className="relative">
          {preview ? (
            // A blob: URL cannot go through next/image, it is only a local preview.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="پیش‌نمایش تصویر پروفایل"
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <Avatar src={avatarUrl} name={name} className="size-20 text-2xl" />
          )}
          {busy ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-navy-900/25"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-navy-900">تصویر پروفایل</p>
          <p className="mt-0.5 text-xs leading-6 text-ink-muted">
            JPG، PNG یا WebP — حداکثر ۲ مگابایت.
          </p>

          <div className="mt-2 flex items-center gap-2">
            <label
              htmlFor="avatar-file"
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                className: busy ? "pointer-events-none opacity-60" : "cursor-pointer",
              })}
            >
              {busy ? "در حال ارسال…" : "انتخاب تصویر"}
            </label>
            <input
              ref={inputRef}
              id="avatar-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              onChange={handleFile}
              className="sr-only"
            />
          </div>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={
          message
            ? `mt-3 text-xs leading-6 ${failed ? "text-accent-strong" : "text-verified-strong"}`
            : "sr-only"
        }
      >
        {message ?? ""}
      </p>
    </div>
  );
}
