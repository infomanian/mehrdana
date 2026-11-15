import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import type { ReportStatus } from "@/types/database";

import { ReportActions } from "./ReportActions";

export const metadata: Metadata = {
  title: "گزارش‌ها",
  robots: { index: false, follow: false },
};

type ReportRow = {
  id: string;
  reason: string;
  note: string | null;
  status: ReportStatus;
  created_at: string;
  reporter_name: string | null;
  reported_name: string | null;
  reported_user_id: string | null;
  reported_banned: boolean | null;
  message_content: string | null;
  message_id: string | null;
  event_title: string | null;
};

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin("/admin/reports");

  const { data, error } = await supabase.rpc("get_reports");
  if (error) throw new Error("admin-reports-unavailable");

  const reports = (data ?? []) as unknown as ReportRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">گزارش‌های کاربران</h1>
      <p className="mt-1 text-sm leading-7 text-ink-muted">
        گزارش‌های ارسال‌شده از اتاق گفتگو را بررسی و مدیریت کنید.
      </p>

      {reports.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <h2 className="text-base font-bold text-navy-900">گزارشی ثبت نشده است</h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            وقتی کاربری پیامی را گزارش دهد، همین‌جا نمایش داده می‌شود.
          </p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {reports.map((report) => (
            <li key={report.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="navy">{report.reason}</Badge>
                    {report.status === "open" ? (
                      <Badge className="bg-accent/10 text-accent-strong">باز</Badge>
                    ) : (
                      <Badge tone="verified">حل‌شده</Badge>
                    )}
                  </div>
                  <span className="text-xs text-ink-muted">{formatDate(report.created_at)}</span>
                </div>

                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-ink-muted">گزارش‌دهنده</dt>
                    <dd className="text-ink">{report.reporter_name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">کاربر گزارش‌شده</dt>
                    <dd className="text-ink">{report.reported_name ?? "—"}</dd>
                  </div>
                </dl>

                {report.message_content ? (
                  <blockquote className="mt-3 rounded-xl bg-canvas px-3 py-2 text-xs leading-6 text-ink-muted">
                    {report.message_content}
                  </blockquote>
                ) : null}

                {report.note ? (
                  <p className="mt-2 text-xs leading-6 text-ink-muted">توضیح: {report.note}</p>
                ) : null}

                <div className="mt-4">
                  <ReportActions
                    reportId={report.id}
                    messageId={report.message_id}
                    reportedUserId={report.reported_user_id}
                    reportedBanned={report.reported_banned ?? false}
                    status={report.status}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
