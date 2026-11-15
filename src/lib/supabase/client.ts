import { createBrowserClient } from "@supabase/ssr";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let cachedClient: BrowserClient | null = null;

/**
 * Browser-side Supabase client (singleton).
 * Returns null while the project has no Supabase credentials, so callers can
 * render a friendly "not configured yet" state instead of throwing.
 */
export function getBrowserClient(): BrowserClient | null {
  if (!isSupabaseConfigured) return null;
  cachedClient ??= createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
