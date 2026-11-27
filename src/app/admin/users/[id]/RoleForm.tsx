"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { inputStyles } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { roleLabels } from "@/lib/labels";
import type { UserRole } from "@/types/database";

import { setUserRole } from "../actions";

const ROLES = Object.keys(roleLabels) as UserRole[];

export function RoleForm({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function save() {
    if (busy || disabled || role === currentRole) return;
    setBusy(true);
    setMessage(null);

    const result = await setUserRole(userId, role);
    setBusy(false);

    if (result.ok) {
      setFailed(false);
      setMessage("سطح دسترسی به‌روز شد.");
      router.refresh();
    } else {
      setFailed(true);
      setMessage(result.message ?? "تغییر سطح دسترسی انجام نشد.");
      setRole(currentRole);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="role-select" className="sr-only">
          نقش کاربر
        </label>
        <select
          id="role-select"
          value={role}
          disabled={busy || disabled}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className={cn(inputStyles, "w-48 appearance-none")}
        >
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {roleLabels[option]}
            </option>
          ))}
        </select>

        <Button
          type="button"
          size="sm"
          disabled={busy || disabled || role === currentRole}
          onClick={save}
        >
          {busy ? "در حال ذخیره…" : "ذخیره نقش"}
        </Button>
      </div>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mt-2 text-xs leading-6",
            failed ? "text-accent-strong" : "text-verified-strong",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
