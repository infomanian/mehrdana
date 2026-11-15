import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerClient, type ServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string | null;
};

/**
 * Verifies the session cookie locally against the project's signing keys.
 *
 * `getClaims()` is preferred over `getSession()` because the cookie is not
 * trusted on its own, and over `getUser()` because it avoids a network round
 * trip to the auth server on every render. React's `cache()` makes the header,
 * the page and any layout share a single verification per request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await getServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const claims = data.claims as Record<string, unknown>;
  const id = typeof claims.sub === "string" ? claims.sub : null;
  if (!id) return null;

  return {
    id,
    email: typeof claims.email === "string" && claims.email ? claims.email : null,
  };
});

/**
 * Data-access helper used by pages and every Server Action.
 *
 * Server Actions are reachable as plain POST endpoints, so a check in the UI or
 * in the proxy is never enough: each one must confirm the caller again.
 */
export async function requireSession(
  nextPath = "/profile",
): Promise<{ supabase: ServerClient; user: SessionUser }> {
  const supabase = await getServerClient();
  if (!supabase) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  return { supabase, user };
}
