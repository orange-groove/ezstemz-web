import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe needs the raw request body to verify the signature. Next.js's
// default request parsing would already have consumed the body, so we force
// the Node runtime and read it as text.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[stripe-webhook] signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const admin = createAdminClient();

  // We only care about a single event for the one-time license model. Add
  // more cases later if you introduce subscriptions / refunds with revoke.
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Defensive: payment_status === 'paid' is what proves money cleared.
      if (session.payment_status !== "paid") break;

      const userId = session.metadata?.supabase_user_id;
      if (!userId) {
        console.error("[stripe-webhook] session missing supabase_user_id metadata", session.id);
        // 200 anyway — Stripe should not retry; the issue is with our own
        // checkout creation flow, not the event.
        break;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      const { error } = await admin.from("purchases").upsert(
        {
          user_id: userId,
          stripe_customer_id: typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          status: "paid",
        },
        { onConflict: "stripe_session_id" },
      );

      if (error) {
        console.error("[stripe-webhook] failed to write purchase", error);
        return NextResponse.json({ error: "DB write failed." }, { status: 500 });
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;

      if (!paymentIntentId) break;

      await admin
        .from("purchases")
        .update({ status: "refunded" })
        .eq("stripe_payment_intent_id", paymentIntentId);
      break;
    }

    default:
      // Unhandled event type; that's fine — Stripe expects a 2xx so it stops
      // retrying. Logging keeps an audit trail without spamming.
      console.log("[stripe-webhook] ignoring event", event.type);
  }

  return NextResponse.json({ received: true });
}
