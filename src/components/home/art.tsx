import { cn } from "@/lib/cn";

/**
 * Deterministic, image-free artwork used where the homepage reference would
 * place photography. Everything is drawn with vector layers so the page stays
 * fast and nothing is borrowed from another site. Real event photos can
 * replace these blocks later without touching the page layout.
 */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay", className)}
      style={{ backgroundImage: GRAIN, backgroundSize: "140px 140px" }}
    />
  );
}

const spines = [
  { width: "13%", height: "88%", className: "bg-clay/90" },
  { width: "9%", height: "72%", className: "bg-sand/80" },
  { width: "16%", height: "96%", className: "bg-charcoal-soft" },
  { width: "7%", height: "64%", className: "bg-cream/35" },
  { width: "12%", height: "80%", className: "bg-clay-soft/85" },
  { width: "10%", height: "90%", className: "bg-sand-deep/70" },
  { width: "14%", height: "70%", className: "bg-cream/25" },
];

export function SpineArt({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_75%_0%,rgba(201,96,63,0.38),transparent_62%)]" />
      <div className="absolute inset-x-[9%] top-[34%] h-px bg-cream/20" />
      <div className="absolute inset-x-0 bottom-0 flex h-[78%] items-end justify-center gap-[2.4%] px-[9%]">
        {spines.map((spine, index) => (
          <div
            key={index}
            className={cn("rounded-t-[3px] border border-cream/10 border-b-0", spine.className)}
            style={{ width: spine.width, height: spine.height }}
          />
        ))}
      </div>
      <Grain />
    </div>
  );
}

export function ArchArt({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-sage", className)} aria-hidden="true">
      <div className="absolute inset-x-[10%] top-[14%] bottom-0 rounded-t-full border border-charcoal/20" />
      <div className="absolute inset-x-[24%] top-[30%] bottom-0 rounded-t-full border border-charcoal/25 bg-sand/50" />
      <div className="absolute inset-x-[38%] top-[48%] bottom-0 rounded-t-full border border-charcoal/30 bg-clay/20" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-charcoal/20" />
      <Grain />
    </div>
  );
}

export function DiscArt({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)} aria-hidden="true">
      <div className="absolute -bottom-[38%] left-1/2 size-[135%] -translate-x-1/2 rounded-full bg-clay-soft/85" />
      <div className="absolute -bottom-[26%] left-1/2 size-[95%] -translate-x-1/2 rounded-full border border-cream/60" />
      <div className="absolute inset-x-0 bottom-[34%] h-px bg-charcoal/25" />
      <Grain />
    </div>
  );
}

export function RuleArt({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-cream-deep", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(31,25,19,0.16)_0px,rgba(31,25,19,0.16)_1px,transparent_1px,transparent_16px)]" />
      <div className="absolute inset-x-[18%] top-[42%] h-[18%] border-y border-clay/45 bg-cream/40" />
      <Grain />
    </div>
  );
}
