import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

// Server-side Supabase client for use in:
//   - Server Components (read-only access; the try/catch on set() swallows the
//     "cookies can only be set in a Server Action or Route Handler" error so
//     RSC reads don't blow up).
//   - Route handlers + Server Actions (writes go through fine).
//
// We re-create the client per request because the cookie store is request
// scoped in the App Router.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — the middleware will refresh the
          // session on the next request so it's safe to ignore here.
        }
      },
    },
  });
}
