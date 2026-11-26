import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

import {
  SESSION_MODE_COOKIE,
  applySessionMode,
  type SessionMode,
} from "./session-mode";

export type ServerClient = ReturnType<typeof createServerClient<Database>>;

/**
 * Server-side Supabase client bound to the request cookies.
 * Returns null when Supabase is not configured yet.
 *
 * `sessionMode` explicitly selects session persistence for the request (used by
 * the login flow). When omitted, the persisted mode from the request cookie is
 * honoured, so token refreshes keep the user's "remember me" choice.
 */
export async function getServerClient(sessionMode?: SessionMode): Promise<ServerClient | null> {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  const mode: SessionMode =
    sessionMode ??
    (cookieStore.get(SESSION_MODE_COOKIE)?.value === "persistent" ? "persistent" : "session");

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, applySessionMode(options, mode));
          }
        } catch {
          // Server Components cannot write cookies; middleware refreshes the session.
        }
      },
    },
  });
}
