"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { deleteMessage, resolveReport } from "./actions";

export function ReportActions({
  reportId,
  messageId,
  status,
}: {
  reportId: string;
  messageId: string | null;
  status: "open" | "resolved";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"resolve" | "delete" | null>(null);

  async function act(kind: "resolve" | "delete") {
    setBusy(kind);
    const result =
      kind === "resolve" ? await resolveReport(reportId) : await deleteMessage(messageId!);
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
    </div>
  );
}
