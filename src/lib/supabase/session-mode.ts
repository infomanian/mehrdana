/**
 * "Remember me" persistence control for the Supabase auth session.
 *
 * Supabase writes the auth tokens as cookies with an expiry date, so by default
 * a session survives a browser/app restart. To honour an opt-in "stay signed
 * in" checkbox we strip that expiry when the user did not opt in, which turns
 * the auth cookies into session cookies that vanish when the browser (or the
 * Android app) closes.
 *
 * The chosen mode is stored in a small, non-secret cookie so the proxy can keep
 * applying the same rule whenever it rotates the refresh token.
 */

export const SESSION_MODE_COOKIE = "mehrdana-session-mode";

export type SessionMode = "persistent" | "session";

const MODE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Cookie options for the session-mode flag (not a secret). */
export const sessionModeCookieOptions = {
  maxAge: MODE_MAX_AGE,
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
};

/**
 * Returns the auth-cookie options unchanged for a persistent session, or with
 * `expires`/`maxAge` removed so the cookie becomes session-scoped.
 */
export function applySessionMode<T>(options: T, mode: SessionMode): T {
  if (mode === "persistent") return options;
  const next: T = { ...options };
  for (const key of ["expires", "maxAge"] as const) {
    delete (next as Record<string, unknown>)[key];
  }
  return next;
}
