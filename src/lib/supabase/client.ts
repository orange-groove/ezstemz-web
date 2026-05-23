import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

// Browser/client component Supabase client. Cookies are managed by the
// browser; this client only reads them. NEVER hold a reference across renders
// in a way that survives login/logout — call createClient() inside the
// component that needs it.
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
