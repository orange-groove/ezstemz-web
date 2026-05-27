/**
 * One-off: grant licenses for paid Checkout sessions that webhooks missed.
 * Usage: node --env-file=.env.local scripts/backfill-stripe-purchases.mjs [session_id ...]
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const defaultSessions = [
  "cs_test_b1YvLkMNz2kqhTvElc3y09kQQPCfCXUlYOXYK8IwPbyS9jKn5Ird4Bk37M",
  "cs_test_b1eDigbgaCewYUeDkd2dhf2IFjFkc9uABm0069BJMbZal9jzv4Qnm5QCAp",
];

const sessionIds = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultSessions;

for (const sessionId of sessionIds) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    console.log(`skip ${sessionId}: not paid`);
    continue;
  }

  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    console.log(`skip ${sessionId}: no supabase_user_id`);
    continue;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { error } = await supabase.from("purchases").upsert(
    {
      user_id: userId,
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      status: "paid",
    },
    { onConflict: "stripe_session_id" },
  );

  if (error) {
    console.error(`fail ${sessionId}:`, error.message);
  } else {
    console.log(`ok ${sessionId} → user ${userId}`);
  }
}
