import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

import {
  SESSION_MODE_COOKIE,
  applySessionMode,
  type SessionMode,
} from "./session-mode";

/** Matches the session cookie written by @supabase/ssr, e.g. sb-abcdef-auth-token. */
const AUTH_COOKIE_PATTERN = /^sb-.+-auth-token(\.\d+)?$/;

/** Routes that require a signed-in user. Prefix match, so nested pages are covered. */
const PROTECTED_PREFIXES = ["/profile"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Refreshes the Supabase session cookie and adds an optimistic guard.
 *
 * The guard only looks for the cookie (no network call), which is the pattern
 * Next.js recommends for the proxy: it is fast and never blocks a request on
 * the auth server. The real check happens in the page and in every Server
 * Action, and the database enforces Row Level Security on top of that.
 *
 * Anonymous visitors skip the network round-trip entirely.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name));

  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !hasSessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!isSupabaseConfigured || !hasSessionCookie) return response;

  const mode: SessionMode =
    request.cookies.get(SESSION_MODE_COOKIE)?.value === "persistent" ? "persistent" : "session";

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // The refreshed tokens must also reach the current render, otherwise a
        // rotated refresh token would be written to the browser while the page
        // still reads the old (now invalid) one.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, applySessionMode(options, mode));
        }
      },
    },
  });

  // Touches the auth server only when a session cookie is actually present.
  await supabase.auth.getUser();

  return response;
}
