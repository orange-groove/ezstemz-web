import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

// Service-role client. Bypasses RLS. ONLY for trusted server contexts where
// the action is not initiated by user-controlled input — i.e. the Stripe
// webhook handler writing a purchase row, or admin maintenance scripts.
//
// The `server-only` import guarantees a build error if this file is ever
// pulled into a client bundle.
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
