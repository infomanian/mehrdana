import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { eventStatusLabels } from "@/lib/labels";
import type { EventStatus } from "@/types/database";

const tones: Record<EventStatus, BadgeTone> = {
  upcoming: "gold",
  live: "verified",
  past: "neutral",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge tone={tones[status]}>
      {status === "live" ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-verified-strong" />
      ) : null}
      {eventStatusLabels[status]}
    </Badge>
  );
}
