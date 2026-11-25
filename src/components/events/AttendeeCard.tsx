import { ConnectButton } from "@/components/events/ConnectButton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Attendee, ConnectionState } from "@/lib/networking";
import type { Json } from "@/types/database";

function socialLinks(json: Json): { label: string; href: string }[] {
  if (!json || typeof json !== "object" || Array.isArray(json)) return [];
  const record = json as Record<string, unknown>;

  const links: { label: string; href: string }[] = [];
  const map: [string, string][] = [
    ["instagram", "اینستاگرام"],
    ["linkedin", "لینکدین"],
    ["telegram", "تلگرام"],
    ["website", "وب‌سایت"],
  ];

  for (const [key, label] of map) {
    const value = record[key];
    if (typeof value !== "string" || !value.trim()) continue;

    let href = value.trim();
    if (key === "instagram") href = `https://instagram.com/${value.replace(/^@/, "")}`;
    else if (key === "telegram") href = `https://t.me/${value.replace(/^@/, "")}`;
    else if (key === "website" && !/^https?:\/\//i.test(value)) href = `https://${value}`;

    links.push({ label, href });
  }

  return links;
}

export function AttendeeCard({
  attendee,
  state,
}: {
  attendee: Attendee;
  state: ConnectionState;
}) {
  const matched = new Set(attendee.matched_interests);
  const links = socialLinks(attendee.social_links);

  return (
    <Card className="flex h-full flex-col p-5 text-center">
      <Avatar
        src={attendee.avatar_url}
        name={attendee.full_name}
        size={64}
        className="mx-auto size-16 text-xl"
      />

      <h3 className="mt-3 truncate text-base font-bold text-navy">
        {attendee.full_name ?? "عضو مهر دانا"}
      </h3>
      {attendee.profession ? (
        <p className="mt-0.5 truncate text-xs text-ink-muted">{attendee.profession}</p>
      ) : null}

      {attendee.bio ? (
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted">{attendee.bio}</p>
      ) : null}

      {attendee.interests.length > 0 ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {attendee.interests.slice(0, 5).map((interest) => (
            <li key={interest}>
              <Badge
                tone={matched.has(interest) ? "verified" : "neutral"}
                className={cn(matched.has(interest) && "font-medium")}
              >
                {interest}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {links.length > 0 ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-navy hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-4">
        <ConnectButton attendeeId={attendee.id} state={state} />
      </div>
    </Card>
  );
}
