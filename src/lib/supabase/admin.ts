import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseUrl } from "@/lib/env";
import {
  isServiceRoleConfigured,
  supabaseServiceRoleKeyValue,
} from "@/lib/server-env";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client for trusted server code ONLY (payment webhooks,
 * the PayPal capture callback and admin email lookups). It bypasses Row Level
 * Security, so it must never be used for user-initiated actions and never
 * imported by a Client Component.
 */
export function getServiceClient() {
  if (!isServiceRoleConfigured) return null;
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKeyValue, {
    auth: { persistSession: false },
  });
}

/** Returns the login email for a user, or null when unavailable (admin-only). */
export async function getAdminUserEmail(userId: string): Promise<string | null> {
  const client = getServiceClient();
  if (!client) return null;

  const { data, error } = await client.auth.admin.getUserById(userId);
  if (error || !data?.user) return null;
  return data.user.email ?? null;
}
