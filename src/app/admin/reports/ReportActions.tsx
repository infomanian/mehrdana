"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { setUserBanned } from "../users/actions";
import { deleteMessage, resolveReport } from "./actions";

export function ReportActions({
  reportId,
  messageId,
  reportedUserId,
  status,
  reportedBanned,
}: {
  reportId: string;
  messageId: string | null;
  reportedUserId: string | null;
  status: "open" | "resolved";
  reportedBanned: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"resolve" | "delete" | "ban" | null>(null);

  async function act(kind: "resolve" | "delete" | "ban") {
    setBusy(kind);
    const result =
      kind === "resolve"
        ? await resolveReport(reportId)
        : kind === "delete"
          ? await deleteMessage(messageId!)
          : await setUserBanned(reportedUserId!, !reportedBanned);
    setBusy(null);
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "open" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() => act("resolve")}
        >
          {busy === "resolve" ? "در حال ثبت…" : "حل‌شده"}
        </Button>
      ) : null}

      {messageId ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy !== null}
          onClick={() => act("delete")}
        >
          {busy === "delete" ? "در حال حذف…" : "حذف پیام"}
        </Button>
      ) : null}

      {reportedUserId ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy !== null}
          onClick={() => act("ban")}
        >
          {busy === "ban" ? "در حال ثبت…" : reportedBanned ? "بازگرداندن کاربر" : "بن کردن کاربر"}
        </Button>
      ) : null}
    </div>
  );
}
