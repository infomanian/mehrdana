import Image from "next/image";

import { CalendarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * 16:9 event cover with a branded fallback, so a missing image never leaves a
 * broken box on the card or the event page. Covers are decorative: the title is
 * always rendered as real text next to them, so the image has an empty alt.
 */
export function EventCover({
  src,
  priority = false,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  className,
}: {
  src?: string | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden bg-navy-900",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
          <div
            aria-hidden="true"
            className="absolute -top-10 -start-8 size-40 rounded-full bg-verified/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-12 end-4 size-44 rounded-full bg-accent-soft/20 blur-3xl"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white/75">
            <CalendarIcon className="size-9" />
          </span>
        </>
      )}
    </div>
  );
}
