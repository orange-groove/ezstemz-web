import "server-only";

import Stripe from "stripe";

import { env } from "@/lib/env";

// Stripe SDK ≥ 17 defaults `apiVersion` to whatever the installed types pin.
// If you want to lock against a specific API version (recommended for
// long-lived production deployments), pass `{ apiVersion: "YYYY-MM-DD.tag" }`
// here and match the same string in the Dashboard → Developers → Webhooks
// endpoint configuration.
export const stripe = new Stripe(env.stripeSecretKey, {
  appInfo: {
    name: "ezstemz-web",
    url: "https://ezstemz.com",
  },
});
