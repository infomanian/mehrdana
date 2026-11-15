"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { setUserBanned } from "./actions";

export function BanButton({ userId, banned }: { userId: string; banned: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const result = await setUserBanned(userId, !banned);
    setBusy(false);
    if (result.ok) router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={banned ? "outline" : "ghost"}
      disabled={busy}
      onClick={toggle}
    >
      {busy ? "…" : banned ? "بازگرداندن" : "بن کردن"}
    </Button>
  );
}
