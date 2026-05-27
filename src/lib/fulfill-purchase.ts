import "server-only";

import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

export type FulfillResult =
  | { ok: true; userId: string; sessionId: string }
  | { ok: false; reason: string };

/** Writes a paid purchase row from a completed Checkout session. */
export async function fulfillPurchaseFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<FulfillResult> {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "payment_not_paid" };
  }

  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    return { ok: false, reason: "missing_supabase_user_id" };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const admin = createAdminClient();
  const { error } = await admin.from("purchases").upsert(
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
    console.error("[fulfill-purchase] DB upsert failed", error);
    return { ok: false, reason: "db_write_failed" };
  }

  return { ok: true, userId, sessionId: session.id };
}
