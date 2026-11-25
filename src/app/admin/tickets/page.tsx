import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatPrice } from "@/lib/format";
import {
  paymentGatewayLabels,
  ticketStatusLabels,
  ticketTypeLabels,
} from "@/lib/labels";
import type { TicketStatus } from "@/types/database";

import { TicketActions } from "./TicketActions";

export const metadata: Metadata = {
  title: "بلیت‌ها",
  robots: { index: false, follow: false },
};

type AdminTicketRow = {
  id: string;
  status: TicketStatus;
  ticket_type: "in_person" | "online" | "recording_only";
  payment_gateway: "fidibo" | "stripe" | "paypal";
  amount_paid: number | null;
  currency: "IRR" | "USD";
  external_ticket_code: string | null;
  created_at: string;
  events: { title: string } | null;
};

function StatusBadge({ status }: { status: TicketStatus }) {
  if (status === "verified") return <Badge tone="verified">{ticketStatusLabels[status]}</Badge>;
  if (status === "pending") {
    return <Badge className="bg-gold/12 text-gold-strong">{ticketStatusLabels[status]}</Badge>;
  }
  return <Badge className="bg-red-50 text-red-700">{ticketStatusLabels[status]}</Badge>;
}

const filters: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "pending", label: "در انتظار" },
  { value: "verified", label: "تأییدشده" },
  { value: "rejected", label: "ردشده" },
];

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const params = await searchParams;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const active: TicketStatus | "all" =
    statusParam === "pending" || statusParam === "verified" || statusParam === "rejected"
      ? statusParam
      : "all";

  const { supabase } = await requireAdmin("/admin/tickets");

  let query = supabase
    .from("tickets")
    .select(
      "id, status, ticket_type, payment_gateway, amount_paid, currency, external_ticket_code, created_at, events(title)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (active !== "all") query = query.eq("status", active);

  const { data, error } = await query;
  if (error) throw new Error("admin-tickets-unavailable");

  const tickets = (data ?? []) as unknown as AdminTicketRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">مدیریت بلیت‌ها</h1>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        بلیت‌های در انتظار را تأیید یا رد کنید.
      </p>

      <nav aria-label="فیلتر وضعیت بلیت" className="mt-4 flex flex-wrap gap-1">
        {filters.map((filter) => {
          const isActive = filter.value === active;
          const href = filter.value === "all" ? "/admin/tickets" : `/admin/tickets?status=${filter.value}`;
          return (
            <a
              key={filter.value}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-navy"
              }
            >
              {filter.label}
            </a>
          );
        })}
      </nav>

      {tickets.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <h2 className="text-base font-bold text-navy">بلیتی ثبت نشده است</h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            با خرید یا ثبت کد فیدیبو، بلیت‌ها در همین صفحه ظاهر می‌شوند.
          </p>
        </Card>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-canvas text-xs text-ink-muted">
                  <th scope="col" className="px-5 py-3 text-start font-medium">رویداد</th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">نوع بلیت</th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">درگاه</th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">مبلغ</th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">وضعیت</th>
                  <th scope="col" className="px-3 py-3 text-start font-medium">تاریخ</th>
                  <th scope="col" className="px-5 py-3 text-start font-medium">اقدام</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-line align-middle">
                    <td className="px-5 py-3 font-medium text-navy">
                      {ticket.events?.title ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-ink">{ticketTypeLabels[ticket.ticket_type]}</td>
                    <td className="px-3 py-3 text-xs text-ink">
                      {paymentGatewayLabels[ticket.payment_gateway]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-ink">
                      {formatPrice(ticket.amount_paid, ticket.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-muted">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      {ticket.status === "pending" ? <TicketActions ticketId={ticket.id} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line md:hidden">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-navy">{ticket.events?.title ?? "—"}</p>
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
                    <dt className="text-ink-muted">تاریخ</dt>
                    <dd className="text-ink">{formatDate(ticket.created_at)}</dd>
                  </div>
                </dl>

                {ticket.status === "pending" ? (
                  <div className="mt-3">
                    <TicketActions ticketId={ticket.id} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
