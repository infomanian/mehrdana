import type { ComponentType, SVGProps } from "react";

import { Card } from "@/components/ui/Card";

/** Placeholder for the tabs that ship in later modules (attendees, chat). */
export function EventComingSoon({
  icon: Icon,
  title,
  body,
  note,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
  note?: string;
}) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-navy/8 text-navy">
        <Icon className="size-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-8 text-ink-muted">{body}</p>
      {note ? (
        <p className="mt-3 rounded-xl bg-canvas px-4 py-2 text-xs leading-6 text-ink-muted">
          {note}
        </p>
      ) : null}
    </Card>
  );
}
