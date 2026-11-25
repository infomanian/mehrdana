import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckoutButtons, type CheckoutOption } from "@/components/events/CheckoutButtons";
import { FidiboCodeForm } from "@/components/events/FidiboCodeForm";
import {
  ExternalLinkIcon,
  LockIcon,
  PlayIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import type { EventAccessLinks, EventDetailRow, OwnTicketRow } from "@/lib/events";
import { ticketTypeLabels } from "@/lib/labels";
import type { TicketType } from "@/types/database";

function formatIrr(value: number): string {
  return value === 0 ? "رایگان" : formatPrice(value, "IRR");
}

function formatUsd(value: number): string {
  return value === 0 ? "رایگان" : formatPrice(value, "USD");
}

function PriceRow({
  label,
  irr,
  usd,
}: {
  label: string;
  irr: number | null;
  usd: number | null;
}) {
  if (irr === null && usd === null) return null;

  return (
    <div className="flex items-start justify-between gap-4 border-t border-line py-3 first:border-t-0 first:pt-0">
      <span className="text-sm font-medium text-navy">{label}</span>
      <span className="text-end">
        {irr !== null ? (
          <span className="block text-sm font-bold text-navy">{formatIrr(irr)}</span>
        ) : null}
        {usd !== null ? (
          <span className="mt-0.5 block text-xs text-ink-muted">{formatUsd(usd)}</span>
        ) : null}
      </span>
    </div>
  );
}

function verifiedTypeLabels(tickets: OwnTicketRow[]): string {
  const types = Array.from(
    new Set(tickets.map((ticket) => ticket.ticket_type as TicketType)),
  ).map((type) => ticketTypeLabels[type]);

  return types.join("، ");
}

export type Gateways = { stripe: boolean; paypal: boolean };

/**
 * The public purchase box plus the private access box.
 *
 * `access` is only filled on the server after a verified ticket was found and
 * `get_event_access` returned the links. This component never fetches secrets
 * and never decides access on its own.
 */
export function EventTicketPanel({
  event,
  tickets,
  access,
  isAuthenticated,
  gateways,
}: {
  event: EventDetailRow;
  tickets: OwnTicketRow[] | null;
  access: EventAccessLinks | null;
  isAuthenticated: boolean;
  gateways: Gateways;
}) {
  const verified = (tickets ?? []).filter((ticket) => ticket.status === "verified");
  const pending = (tickets ?? []).filter((ticket) => ticket.status === "pending");
  const hasVerified = verified.length > 0;
  const isPast = event.status === "past";
  const loginHref = `/login?next=${encodeURIComponent(`/events/${event.id}`)}`;

  const hasAnyPrice =
    event.price_in_person_irr !== null ||
    event.price_online_irr !== null ||
    event.price_in_person_usd !== null ||
    event.price_online_usd !== null ||
    event.recording_price_irr !== null ||
    event.recording_price_usd !== null;

  const checkoutOptions: CheckoutOption[] = isPast
    ? event.recording_price_usd !== null
      ? [{ ticketType: "recording_only", label: "ضبط رویداد", usd: event.recording_price_usd }]
      : []
    : [
        ...(event.price_in_person_usd !== null
          ? [{ ticketType: "in_person" as TicketType, label: "حضوری", usd: event.price_in_person_usd }]
          : []),
        ...(event.price_online_usd !== null
          ? [{ ticketType: "online" as TicketType, label: "آنلاین", usd: event.price_online_usd }]
          : []),
      ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-navy">
            {isPast ? "ضبط رویداد" : "بلیت رویداد"}
          </h2>
          {hasVerified ? <Badge tone="verified">بلیت تأییدشده</Badge> : null}
        </div>

        <div className="mt-3">
          {isPast ? (
            <PriceRow
              label="دسترسی به ضبط"
              irr={event.recording_price_irr}
              usd={event.recording_price_usd}
            />
          ) : (
            <>
              <PriceRow
                label="شرکت حضوری"
                irr={event.price_in_person_irr}
                usd={event.price_in_person_usd}
              />
              <PriceRow
                label="شرکت آنلاین"
                irr={event.price_online_irr}
                usd={event.price_online_usd}
              />
            </>
          )}
        </div>

        {!hasAnyPrice ? (
          <p className="rounded-xl bg-canvas px-3 py-2 text-xs leading-6 text-ink-muted">
            قیمت‌ها به‌زودی اعلام می‌شود.
          </p>
        ) : null}

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs font-bold text-navy">خرید در ایران (فیدیبو)</p>

          {event.fidibo_url ? (
            <ButtonLink
              href={event.fidibo_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              خرید از فیدیبو
              <ExternalLinkIcon className="size-4" />
            </ButtonLink>
          ) : (
            <p className="mt-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs leading-6 text-ink-muted">
              لینک خرید فیدیبو به‌زودی اضافه می‌شود.
            </p>
          )}

          {isAuthenticated ? (
            <FidiboCodeForm eventId={event.id} />
          ) : (
            <p className="mt-2 text-[11px] leading-6 text-ink-muted">
              برای ثبت کد بلیت فیدیبو ابتدا وارد حساب شوید.
            </p>
          )}
        </div>

        {checkoutOptions.length > 0 ? (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-xs font-bold text-navy">خرید بین‌المللی (کارت دلاری)</p>

            {isAuthenticated ? (
              <CheckoutButtons
                eventId={event.id}
                options={checkoutOptions}
                gateways={gateways}
              />
            ) : (
              <p className="mt-2 text-[11px] leading-6 text-ink-muted">
                برای خرید دلاری با استرایپ یا پی‌پال وارد حساب شوید.
              </p>
            )}
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold text-navy">دسترسی شما</h2>

        {!isAuthenticated ? (
          <div className="mt-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-sand/70 text-navy">
              <LockIcon className="size-5" />
            </span>
            <p className="mt-3 text-xs leading-7 text-ink-muted">
              لینک پخش زنده و فایل ضبط فقط برای دارندگان بلیت تأییدشده نمایش داده
              می‌شود. برای دیدن وضعیت بلیت خود وارد شوید.
            </p>
            <ButtonLink href={loginHref} variant="outline" size="sm" className="mt-3">
              ورود به حساب
            </ButtonLink>
          </div>
        ) : hasVerified ? (
          <div className="mt-3 space-y-3">
            <p className="text-xs leading-7 text-ink-muted">
              بلیت‌های {verifiedTypeLabels(verified)} شما تأیید شده است.
            </p>

            <ButtonLink href={`/events/${event.id}/chat`} className="w-full" size="md">
              ورود به اتاق گفتگو
            </ButtonLink>

            {!isPast && access?.skyroom_link ? (
              <ButtonLink
                href={access.skyroom_link}
                target="_blank"
                rel="noopener noreferrer"
                variant="ink"
                className="w-full"
              >
                <VideoIcon className="size-4" />
                ورود به پخش زنده
              </ButtonLink>
            ) : null}

            {isPast && access?.recording_media_url ? (
              <ButtonLink
                href={access.recording_media_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="ink"
                className="w-full"
              >
                <PlayIcon className="size-4" />
                تماشای ضبط رویداد
              </ButtonLink>
            ) : null}

            {(!isPast && !access?.skyroom_link) || (isPast && !access?.recording_media_url) ? (
              <p className="rounded-xl bg-canvas px-3 py-2 text-xs leading-6 text-ink-muted">
                {isPast
                  ? "فایل ضبط به‌زودی در همین بخش قرار می‌گیرد."
                  : "لینک پخش زنده به‌زودی در همین بخش قرار می‌گیرد."}
              </p>
            ) : null}
          </div>
        ) : pending.length > 0 ? (
          <p className="mt-3 rounded-xl border border-gold/30 bg-gold/12 px-3 py-2 text-xs leading-7 text-gold-strong">
            بلیت‌های {verifiedTypeLabels(pending)} شما در انتظار تأیید است. پس از تأیید،
            لینک‌های اختصاصی در همین بخش نمایش داده می‌شود.
          </p>
        ) : (
          <div className="mt-3">
            <p className="text-xs leading-7 text-ink-muted">
              برای این رویداد بلیت تأییدشده‌ای برای حساب شما ثبت نشده است. پس از
              خرید و تأیید بلیت، اتاق گفتگو و لینک‌های اختصاصی باز می‌شود.
            </p>
          </div>
        )}
      </Card>

      {event.profiles ? (
        <Card className="p-5">
          <h2 className="text-sm font-bold text-navy">سخنران</h2>
          <div className="mt-3 flex items-center gap-3">
            <Avatar
              src={event.profiles.avatar_url}
              name={event.profiles.full_name}
              className="size-12 shrink-0 text-base"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">
                {event.profiles.full_name ?? "سخنران مهر دانا"}
              </p>
              {event.profiles.profession ? (
                <p className="truncate text-xs text-ink-muted">{event.profiles.profession}</p>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
