import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

// Edge-runtime safe session refresh. Runs before every request; Supabase's
// SSR helper rotates the access/refresh token cookies in-place when they are
// near expiry so downstream route handlers / RSC see a fresh session.
//
// IMPORTANT: do not delete the `supabase.auth.getUser()` call below — that
// call is what actually validates and refreshes the session. Removing it is
// the most common cause of "user appears logged in but RLS denies queries".
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the /account and /download segments at the edge so unauthenticated
  // users get bounced to /login instead of hitting the server component and
  // discovering the auth failure further down the request lifecycle.
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/account") || pathname.startsWith("/download");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
