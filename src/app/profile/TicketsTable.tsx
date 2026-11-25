import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TicketIcon } from "@/components/ui/icons";
import { formatDate, formatPrice } from "@/lib/format";
import {
  paymentGatewayLabels,
  ticketStatusLabels,
  ticketTypeLabels,
} from "@/lib/labels";
import type { Database } from "@/types/database";

export type TicketHistoryRow =
  Database["public"]["Functions"]["get_my_ticket_history"]["Returns"][number];

function StatusBadge({ status }: { status: TicketHistoryRow["status"] }) {
  if (status === "verified") {
    return <Badge tone="verified">{ticketStatusLabels[status]}</Badge>;
  }
  if (status === "pending") {
    return <Badge className="bg-accent/10 text-accent-strong">{ticketStatusLabels[status]}</Badge>;
  }
  return <Badge className="bg-red-50 text-red-700">{ticketStatusLabels[status]}</Badge>;
}

/**
 * Payment history, derived from the `tickets` table: every ticket row already
 * carries the gateway, amount and verification status, so no separate payments
 * table is needed. Rows arrive already filtered to the signed-in user.
 */
export function TicketsTable({ tickets }: { tickets: TicketHistoryRow[] }) {
  if (tickets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-navy/8 text-navy">
          <TicketIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-base font-bold text-navy">هنوز بلیتی ثبت نشده است</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-7 text-ink-muted">
          پس از خرید یا ثبت کد بلیت فیدیبو، بلیت‌ها و پرداخت‌های شما در همین صفحه نمایش
          داده می‌شود.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-medium text-navy hover:underline"
        >
          بازگشت به صفحه اصلی
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
        <h2 className="text-sm font-bold text-navy">بلیت‌ها و پرداخت‌ها</h2>
        <span className="text-xs text-ink-muted">{tickets.length} مورد</span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-canvas text-xs text-ink-muted">
              <th scope="col" className="px-5 py-3 text-start font-medium">
                رویداد
              </th>
              <th scope="col" className="px-3 py-3 text-start font-medium">
                نوع بلیت
              </th>
              <th scope="col" className="px-3 py-3 text-start font-medium">
                درگاه
              </th>
              <th scope="col" className="px-3 py-3 text-start font-medium">
                مبلغ
              </th>
              <th scope="col" className="px-3 py-3 text-start font-medium">
                وضعیت
              </th>
              <th scope="col" className="px-5 py-3 text-start font-medium">
                تاریخ خرید
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} className="border-t border-line align-top">
                <td className="px-5 py-4">
                  <p className="font-medium text-navy">{ticket.event_title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatDate(ticket.event_date)}
                  </p>
                </td>
                <td className="px-3 py-4 text-xs text-ink">{ticketTypeLabels[ticket.ticket_type]}</td>
                <td className="px-3 py-4 text-xs text-ink">
                  {paymentGatewayLabels[ticket.payment_gateway]}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-xs text-ink">
                  {formatPrice(ticket.amount_paid, ticket.currency)}
                </td>
                <td className="px-3 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-ink-muted">
                  {formatDate(ticket.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden">
        {tickets.map((ticket) => (
          <li key={ticket.ticket_id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-navy">{ticket.event_title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {formatDate(ticket.event_date)}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-ink-muted">نوع بلیت</dt>
                <dd className="text-ink">{ticketTypeLabels[ticket.ticket_type]}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">درگاه</dt>
                <dd className="text-ink">{paymentGatewayLabels[ticket.payment_gateway]}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">مبلغ</dt>
                <dd className="text-ink">{formatPrice(ticket.amount_paid, ticket.currency)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">تاریخ خرید</dt>
                <dd className="text-ink">{formatDate(ticket.created_at)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </Card>
  );
}
