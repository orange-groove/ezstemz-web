// Centralised env access. Throwing on missing values turns silent breakage
// (Stripe webhook signature mismatch, Supabase 401s, etc.) into loud,
// well-located errors.
//
// IMPORTANT: every `NEXT_PUBLIC_*` getter MUST reference the variable by its
// literal name (e.g. `process.env.NEXT_PUBLIC_SUPABASE_URL`). Next.js inlines
// these at build time via static analysis — `process.env[varName]` with a
// dynamic `varName` is NOT replaced, and in the browser bundle that yields
// `undefined`, even when the variable is set in the hosting env.

function required(value: string | undefined, name: string): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required env var ${name}. Set it in your hosting provider's ` +
        `environment (Render Dashboard, Vercel project settings, etc.) — or ` +
        `in .env.local for local development. NEXT_PUBLIC_* vars are baked ` +
        `at build time, so changing them requires a redeploy.`,
    );
  }
  return value;
}

function optional(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  get siteUrl() {
    return required(process.env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL");
  },
  get supabaseUrl() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  },
  get stripeSecretKey() {
    return required(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return required(process.env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET");
  },
  get stripePriceId() {
    return required(process.env.STRIPE_PRICE_ID, "STRIPE_PRICE_ID");
  },
  get stripePublishableKey() {
    return optional(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  },
  get githubRepo() {
    return required(process.env.GITHUB_REPO, "GITHUB_REPO");
  },
  get githubToken() {
    return optional(process.env.GITHUB_TOKEN);
  },
};
