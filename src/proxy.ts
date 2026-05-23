import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the request-time interception layer from `middleware`
// to `proxy`. Same matcher, same NextResponse return — only the file name
// and exported function name changed.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets and Next.js internals; everything user-facing
  // (including marketing pages, so the nav can render logged-in state)
  // flows through the session refresh.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
