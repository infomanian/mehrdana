"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { respondToRequest, sendFriendRequest } from "@/app/messages/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { ConnectionState } from "@/lib/networking";

/**
 * Per-attendee action. Renders the right control for the current connection
 * state and refreshes the page after a change so the server recomputes it.
 */
export function ConnectButton({
  attendeeId,
  state,
}: {
  attendeeId: string;
  state: ConnectionState;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSend() {
    setBusy(true);
    setNotice(null);
    const result = await sendFriendRequest(attendeeId);
    setBusy(false);
    setNotice(result.message ?? null);
    if (result.ok) router.refresh();
  }

  async function handleRespond(action: "accepted" | "rejected") {
    if (state.kind !== "pending_received") return;
    setBusy(true);
    setNotice(null);
    const result = await respondToRequest(state.connectionId, action);
    setBusy(false);
    setNotice(result.message ?? null);
    if (result.ok) router.refresh();
  }

  if (state.kind === "none") {
    return (
      <div>
        <Button type="button" size="sm" className="w-full" disabled={busy} onClick={handleSend}>
          {busy ? "در حال ارسال…" : "درخواست دوستی"}
        </Button>
        {notice ? (
          <p role="status" className="mt-1.5 text-center text-[11px] leading-5 text-ink-muted">
            {notice}
          </p>
        ) : null}
      </div>
    );
  }

  if (state.kind === "pending_sent") {
    return <p className="text-xs text-ink-muted">درخواست ارسال شده</p>;
  }

  if (state.kind === "pending_received") {
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => handleRespond("accepted")}
        >
          {busy ? "…" : "پذیرش"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => handleRespond("rejected")}
        >
          {busy ? "…" : "رد"}
        </Button>
      </div>
    );
  }

  return (
    <ButtonLink href={`/messages/${state.connectionId}`} size="sm" variant="outline" className="w-full">
      پیام دادن
    </ButtonLink>
  );
}
