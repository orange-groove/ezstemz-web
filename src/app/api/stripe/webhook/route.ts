import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { fulfillPurchaseFromCheckoutSession } from "@/lib/fulfill-purchase";
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await fulfillPurchaseFromCheckoutSession(session);
      if (!result.ok && result.reason === "db_write_failed") {
        return NextResponse.json({ error: "DB write failed." }, { status: 500 });
      }
      if (!result.ok && result.reason === "missing_supabase_user_id") {
        console.error("[stripe-webhook] session missing supabase_user_id metadata", session.id);
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
      console.log("[stripe-webhook] ignoring event", event.type);
  }

  return NextResponse.json({ received: true });
}
