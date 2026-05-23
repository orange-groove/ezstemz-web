import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Handles the link Supabase emails for signup confirmation + password reset.
// Supports both flows so the same handler works whether or not the project
// has a customised email template:
//
//   - PKCE flow (default `{{ .ConfirmationURL }}` template):
//       /auth/confirm?code=<auth_code>&redirectTo=/account
//     We exchange the code for a session and the SSR client writes the
//     auth cookies.
//
//   - Token-hash OTP flow (template customised to use `{{ .TokenHash }}`):
//       /auth/confirm?token_hash=<hash>&type=email&redirectTo=/account
//     We verify the OTP directly.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirectTo") ?? searchParams.get("next") ?? "/account";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  return NextResponse.redirect(new URL("/login?error=invalid_link", origin));
}
