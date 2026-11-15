/**
 * Environment access is centralised here so a missing key never crashes a
 * build or a server render. When Supabase is not configured the UI keeps
 * working and simply reports that the backend is not connected yet.
 */
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

export const supabaseUrl = rawUrl.replace(/\/+$/, "");
export const supabaseAnonKey = rawAnonKey;

/** True only when both public Supabase values are present. */
export const isSupabaseConfigured =
  supabaseUrl.startsWith("http") && supabaseAnonKey.length > 20;

export const siteUrl = (rawSiteUrl || "http://localhost:3000").replace(/\/+$/, "");
