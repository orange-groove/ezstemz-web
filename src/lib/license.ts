import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LicenseStatus = {
  hasLicense: boolean;
  purchasedAt: string | null;
};

// One source of truth for "is this user allowed to download the app?".
// Re-used by /account, /download, and the /api/download route handler.
export async function getLicenseStatus(userId: string): Promise<LicenseStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("created_at, status")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // RLS misconfig or DB outage — fail closed.
    console.error("[license] lookup failed", error);
    return { hasLicense: false, purchasedAt: null };
  }

  if (!data) {
    return { hasLicense: false, purchasedAt: null };
  }

  return { hasLicense: true, purchasedAt: data.created_at };
}
