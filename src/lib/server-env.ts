import "server-only";

/**
 * Server-only secrets. Everything here must stay out of the browser bundle;
 * the `server-only` import makes importing this module from a Client Component
 * a build error. Public keys (NEXT_PUBLIC_*) live in `@/lib/env` instead.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

const paypalClientId = process.env.PAYPAL_CLIENT_ID?.trim() ?? "";
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "";
const paypalMode = process.env.PAYPAL_MODE?.trim() === "live" ? "live" : "sandbox";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

export const stripeConfig = {
  configured: stripeSecretKey.startsWith("sk_") && stripeWebhookSecret.startsWith("whsec_"),
  secretKey: stripeSecretKey,
  webhookSecret: stripeWebhookSecret,
};

export const paypalConfig = {
  configured: paypalClientId.length > 0 && paypalClientSecret.length > 0,
  clientId: paypalClientId,
  clientSecret: paypalClientSecret,
  mode: paypalMode,
  baseUrl:
    paypalMode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
};

export const isServiceRoleConfigured = supabaseServiceRoleKey.length > 20;
export const supabaseServiceRoleKeyValue = supabaseServiceRoleKey;
