"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { EventCover } from "@/components/events/EventCover";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import { getBrowserClient } from "@/lib/supabase/client";

import { saveEventCover } from "./actions";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function extensionFor(type: string): "jpg" | "png" | "webp" {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Uploads the cover straight from the browser to the `event-covers` bucket.
 * Storage rules allow only admins to write, and the path is always inside this
 * event's own folder. The server action then stores the public URL.
 */
export function CoverUploader({
  eventId,
  coverUrl,
}: {
  eventId: string;
  coverUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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
      setMessage("حجم تصویر باید کمتر از ۴ مگابایت باشد.");
      setFailed(true);
      event.target.value = "";
      return;
    }

    setBusy(true);
    setPreview(URL.createObjectURL(file));

    try {
      const supabase = getBrowserClient();
      if (!supabase) throw new Error("supabase-not-configured");

      const path = `${eventId}/cover.${extensionFor(file.type)}`;
      const { error } = await supabase.storage.from("event-covers").upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });
      if (error) throw error;

      const result = await saveEventCover(eventId, path);
      if (!result.ok) throw new Error(result.message ?? "save-failed");

      setMessage("تصویر کاور به‌روز شد.");
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
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-bold text-navy">تصویر کاور</h2>
      <p className="mt-1 text-xs leading-6 text-ink-muted">
        JPG، PNG یا WebP — حداکثر ۴ مگابایت. نسبت تصویر ۱۶:۹ پیشنهاد می‌شود.
      </p>

      <div className="mt-4">
        {preview ? (
          // A blob: URL cannot go through next/image, it is only a local preview.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="پیش‌نمایش تصویر کاور"
            className="aspect-[16/9] w-full rounded-xl object-cover"
          />
        ) : (
          <EventCover src={coverUrl} className="rounded-xl" sizes="(min-width: 768px) 50vw, 100vw" />
        )}

        {busy ? (
          <span aria-hidden="true" className="mt-3 block h-2 w-full animate-pulse rounded-full bg-navy/8" />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor="cover-file"
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
          id="cover-file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={handleFile}
          className="sr-only"
        />

        <p
          role="status"
          aria-live="polite"
          className={
            message
              ? `text-xs leading-6 ${failed ? "text-accent-strong" : "text-verified-strong"}`
              : "sr-only"
          }
        >
          {message ?? ""}
        </p>
      </div>
    </Card>
  );
}
