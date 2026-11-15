"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { respondToRequest } from "@/app/messages/actions";
import { Button } from "@/components/ui/Button";

/** Accept / reject buttons for an incoming friend request. */
export function RequestActions({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accepted" | "rejected" | null>(null);

  async function act(action: "accepted" | "rejected") {
    setBusy(action);
    await respondToRequest(connectionId, action);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button
        type="button"
        size="sm"
        disabled={busy !== null}
        onClick={() => act("accepted")}
      >
        {busy === "accepted" ? "در حال پذیرش…" : "پذیرش"}
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
