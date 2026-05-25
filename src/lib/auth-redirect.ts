// Helpers for Supabase email confirmation links.
//
// Supabase redirect URL allow-listing uses exact string matching. Query params
// on emailRedirectTo (e.g. ?redirectTo=/pricing) often aren't listed in the
// dashboard, which breaks confirmation links. We keep the redirect URL clean
// and store the post-confirm destination in user metadata instead.

const DEFAULT_REDIRECT = "/account";

export function getAuthConfirmUrl(origin?: string): string {
  const base =
    origin ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/auth/confirm`;
}

export function authRedirectMetadata(redirectTo: string) {
  return { redirect_to: redirectTo || DEFAULT_REDIRECT };
}

export function resolvePostAuthRedirect(
  ...candidates: Array<string | null | undefined>
): string {
  for (const value of candidates) {
    if (value && value.startsWith("/") && !value.startsWith("//")) {
      return value;
    }
  }
  return DEFAULT_REDIRECT;
}

export function isEmailRateLimitError(message: string): boolean {
  return /rate limit/i.test(message);
}

export function isEmailNotAuthorizedError(code: string | undefined, message: string): boolean {
  return (
    code === "email_address_not_authorized" ||
    /not authorized/i.test(message) ||
    /email address cannot be used/i.test(message)
  );
}

export const CUSTOM_SMTP_REQUIRED_MESSAGE =
  "Supabase's built-in email only delivers to addresses on your Supabase organization's team. " +
  "Real signups need custom SMTP: Supabase Dashboard → Authentication → SMTP → enable and add " +
  "a provider (Resend is free). See README §2 step 6.";

export function isExistingAccountSignup(user: { identities?: unknown[] } | null): boolean {
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}
