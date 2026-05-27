import "server-only";

import { env } from "@/lib/env";

type Platform = "macos" | "windows";

type GitHubAsset = {
  id: number;
  name: string;
  browser_download_url: string;
  url: string;
  size: number;
};

type GitHubRelease = {
  tag_name: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  assets: GitHubAsset[];
};

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ezstemz-web",
  };
  if (env.githubToken) {
    headers.Authorization = `Bearer ${env.githubToken}`;
  }
  return headers;
}

// Fetch the most recent published, non-draft release from the configured
// ezstemz repo. Cached for 5 minutes via `next: { revalidate }` so we don't
// hammer the GitHub API on every account-page render.
export async function getLatestRelease(): Promise<GitHubRelease | null> {
  const res = await fetch(`https://api.github.com/repos/${env.githubRepo}/releases/latest`, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });

  if (res.status === 404) {
    if (!env.githubToken) {
      throw new Error(
        `No release found for ${env.githubRepo}. If the repo is private, set GITHUB_TOKEN ` +
          `(fine-grained PAT with Contents: read). Also verify GITHUB_REPO is correct.`,
      );
    }
    return null;
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `GitHub denied access to ${env.githubRepo} (${res.status}). Check GITHUB_TOKEN scopes.`,
    );
  }
  if (!res.ok) {
    throw new Error(`GitHub releases lookup failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as GitHubRelease;
}

function pickAssetForPlatform(release: GitHubRelease, platform: Platform): GitHubAsset | null {
  const matchers: Record<Platform, RegExp> = {
    // macOS DMG produced by scripts/release in the ezstemz repo.
    macos: /\.dmg$/i,
    // NSIS installer named EZStemz-<version>-Setup.exe.
    windows: /-Setup\.exe$/i,
  };
  return release.assets.find((a) => matchers[platform].test(a.name)) ?? null;
}

// Returns a URL that, when visited, downloads the asset for the requested
// platform. We hit the GitHub asset API with `Accept: application/octet-stream`
// and follow no redirects — the resulting Location is a short-lived signed
// objects URL, which we 302 back to the caller. This pattern works whether
// the underlying repo is public OR private (so long as GITHUB_TOKEN has
// `repo` access in the private case).
export async function resolveAssetDownloadUrl(
  assetId: number,
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${env.githubRepo}/releases/assets/${assetId}`,
    {
      headers: { ...authHeaders(), Accept: "application/octet-stream" },
      redirect: "manual",
    },
  );

  if (res.status !== 302) {
    throw new Error(
      `Expected 302 from GitHub asset endpoint, got ${res.status} ${res.statusText}`,
    );
  }
  const location = res.headers.get("location");
  if (!location) {
    throw new Error("GitHub asset endpoint responded without Location header");
  }
  return location;
}

export type LatestReleaseInfo = {
  tagName: string;
  publishedAt: string | null;
  macos: { assetId: number; name: string; size: number } | null;
  windows: { assetId: number; name: string; size: number } | null;
};

export async function getLatestReleaseInfo(): Promise<LatestReleaseInfo | null> {
  const release = await getLatestRelease();
  if (!release) return null;

  const mac = pickAssetForPlatform(release, "macos");
  const win = pickAssetForPlatform(release, "windows");

  return {
    tagName: release.tag_name,
    publishedAt: release.published_at,
    macos: mac ? { assetId: mac.id, name: mac.name, size: mac.size } : null,
    windows: win ? { assetId: win.id, name: win.name, size: win.size } : null,
  };
}

export type { Platform };
