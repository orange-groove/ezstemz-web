// Centralised env access. Throwing on missing values turns silent breakage
// (Stripe webhook signature mismatch, Supabase 401s, etc.) into loud,
// well-located errors. Each getter is lazy so that build steps that import
// shared code without needing every secret (e.g. building the marketing pages
// without Stripe keys configured locally) keep working.

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required env var ${name}. Set it in .env.local (see .env.local.example).`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  get siteUrl() {
    return required("NEXT_PUBLIC_SITE_URL");
  },
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
  },
  get stripePriceId() {
    return required("STRIPE_PRICE_ID");
  },
  get stripePublishableKey() {
    return optional("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  },
  get githubRepo() {
    return required("GITHUB_REPO");
  },
  get githubToken() {
    return optional("GITHUB_TOKEN");
  },
};
