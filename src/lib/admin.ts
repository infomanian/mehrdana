import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { getSessionUser, type SessionUser } from "@/lib/auth";
import { getServerClient, type ServerClient } from "@/lib/supabase/server";

export type AdminContext = {
  supabase: ServerClient;
  user: SessionUser;
};

/**
 * Server-side gate for every admin page and every admin Server Action.
 *
 * A layout check alone is not enough: Server Actions are reachable as plain
 * POST endpoints. `cache()` keeps a page + layout within one request on a
 * single database check. Non-admins get a 404 so the panel's existence is not
 * disclosed.
 */
export const requireAdmin = cache(
  async (nextPath = "/admin/events"): Promise<AdminContext> => {
    const supabase = await getServerClient();
    if (!supabase) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

    const user = await getSessionUser();
    if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw new Error("admin-check-failed");
    if (!data || data.role !== "admin") notFound();

    return { supabase, user };
  },
);
