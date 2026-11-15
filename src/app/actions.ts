"use server";

import { redirect } from "next/navigation";

import { getServerClient } from "@/lib/supabase/server";

/**
 * Clears the session cookie and returns home.
 * Safe to call when Supabase is not configured yet (becomes a no-op).
 */
export async function signOutAction(): Promise<void> {
  const supabase = await getServerClient();
  await supabase?.auth.signOut();

  redirect("/");
}
