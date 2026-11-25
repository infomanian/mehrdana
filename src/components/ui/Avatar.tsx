import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Avatar with a graceful initial-letter fallback.
 * `src` is always a Supabase Storage public URL (see saveAvatar), which matches
 * the remote pattern configured in next.config.ts.
 */
export function Avatar({
  src,
  name,
  size = 96,
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const label = name?.trim() || "عضو مهر دانا";

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex select-none items-center justify-center rounded-full bg-navy/8 text-xl font-bold text-navy",
          className,
        )}
      >
        {Array.from(label)[0] ?? "م"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`تصویر پروفایل ${label}`}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
    />
  );
}
