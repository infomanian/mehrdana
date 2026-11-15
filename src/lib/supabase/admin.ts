import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseUrl } from "@/lib/env";
import {
  isServiceRoleConfigured,
  supabaseServiceRoleKeyValue,
} from "@/lib/server-env";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client for trusted server code ONLY (payment webhooks
 * and the PayPal capture callback). It bypasses Row Level Security, so it must
 * never be used for user-initiated actions and never imported by a Client
 * Component.
 */
export function getServiceClient() {
  if (!isServiceRoleConfigured) return null;
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKeyValue, {
    auth: { persistSession: false },
  });
}
