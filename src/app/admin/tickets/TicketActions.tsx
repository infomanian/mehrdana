"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { setTicketStatus } from "./actions";

/** Approve / reject buttons for a pending ticket. */
export function TicketActions({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"verified" | "rejected" | null>(null);

  async function act(status: "verified" | "rejected") {
    setBusy(status);
    const result = await setTicketStatus(ticketId, status);
    setBusy(null);
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => act("verified")}
      >
        {busy === "verified" ? "در حال تأیید…" : "تأیید"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy !== null}
        onClick={() => act("rejected")}
      >
        {busy === "rejected" ? "در حال رد…" : "رد"}
      </Button>
    </div>
  );
}
