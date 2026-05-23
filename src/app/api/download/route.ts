import { type NextRequest, NextResponse } from "next/server";

import { getLatestReleaseInfo, resolveAssetDownloadUrl, type Platform } from "@/lib/github";
import { getLicenseStatus } from "@/lib/license";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
// Each hit resolves a fresh short-lived URL — never serve a cached value.
export const dynamic = "force-dynamic";

const SUPPORTED: Platform[] = ["macos", "windows"];

function isPlatform(value: string | null): value is Platform {
  return value !== null && (SUPPORTED as string[]).includes(value);
}

// Gated download endpoint.
//   1. Confirms the request belongs to a logged-in user with a paid purchase.
//   2. Looks up the latest GitHub release.
//   3. Asks GitHub for a short-lived signed asset URL.
//   4. 302s the user straight at it.
//
// Returning 302 means the browser performs the actual download against
// GitHub's CDN, not through this Next.js function — so we don't pay egress
// or hit the serverless response size limit.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?redirectTo=/download", request.url));
  }

  const license = await getLicenseStatus(user.id);
  if (!license.hasLicense) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const platform = new URL(request.url).searchParams.get("platform");
  if (!isPlatform(platform)) {
    return NextResponse.json(
      { error: "Specify ?platform=macos or ?platform=windows." },
      { status: 400 },
    );
  }

  const release = await getLatestReleaseInfo();
  if (!release) {
    return NextResponse.json({ error: "No published release yet." }, { status: 404 });
  }

  const asset = release[platform];
  if (!asset) {
    return NextResponse.json(
      { error: `No ${platform} asset on the latest release.` },
      { status: 404 },
    );
  }

  try {
    const signedUrl = await resolveAssetDownloadUrl(asset.assetId);
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[download] could not resolve asset URL", message);
    return NextResponse.json(
      { error: "Could not generate download link." },
      { status: 502 },
    );
  }
}
