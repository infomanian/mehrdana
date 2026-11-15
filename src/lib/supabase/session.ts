import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

/** Matches the session cookie written by @supabase/ssr, e.g. sb-abcdef-auth-token. */
const AUTH_COOKIE_PATTERN = /^sb-.+-auth-token(\.\d+)?$/;

/**
 * Refreshes the Supabase session cookie when one exists.
 *
 * This phase intentionally performs no route protection (auth arrives later).
 * Anonymous visitors skip the network round-trip entirely, which keeps every
 * page load fast and avoids hammering the auth server.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name));

  if (!hasSessionCookie) return response;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touches the auth server only when a session cookie is actually present.
  await supabase.auth.getUser();

  return response;
}
