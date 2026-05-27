import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuApple, LuDownload, LuMonitor } from "react-icons/lu";

import { MarketingShell } from "@/components/site/marketing-shell";
import { getLatestReleaseInfo } from "@/lib/github";
import { getLicenseStatus } from "@/lib/license";
import { WINDOWS_COMING_SOON } from "@/lib/platforms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Download EZStemz" };

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  const mb = n / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

export default async function DownloadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/download");

  const license = await getLicenseStatus(user.id);
  if (!license.hasLicense) {
    redirect("/pricing");
  }

  // If the GitHub API is down or misconfigured, render the page anyway with
  // a clear error — the user is licensed and shouldn't feel locked out.
  let release: Awaited<ReturnType<typeof getLatestReleaseInfo>> = null;
  let lookupError: string | null = null;
  try {
    release = await getLatestReleaseInfo();
  } catch (err) {
    lookupError = err instanceof Error ? err.message : String(err);
  }

  return (
    <MarketingShell>
      <Container maxW="4xl" py={{ base: 14, md: 20 }}>
        <Stack gap={8}>
          <Stack gap={2}>
            <Heading size="3xl">Download EZStemz</Heading>
            <Text color="fg.muted">
              {release
                ? `Latest release: ${release.tagName}`
                : lookupError
                  ? "Could not load release info."
                  : "No published GitHub release found yet."}
            </Text>
          </Stack>

          {lookupError && (
            <Box
              borderWidth="1px"
              borderColor="red.500"
              borderRadius="md"
              p={4}
              bg="red.900/30"
            >
              <Text fontWeight="medium">Couldn't talk to GitHub Releases.</Text>
              <Text color="fg.muted" fontSize="sm">
                {lookupError}
              </Text>
            </Box>
          )}

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <PlatformCard
                icon={<LuApple />}
                label="macOS"
                helper="Apple Silicon + Intel · .dmg"
                assetName={release?.macos?.name ?? null}
                assetSize={release?.macos?.size ?? null}
                downloadHref={
                  release?.macos ? `/api/download?platform=macos` : null
                }
              />
            </GridItem>
            <GridItem>
              <PlatformCard
                icon={<LuMonitor />}
                label="Windows"
                helper="Windows 10+ · NSIS installer · .exe"
                comingSoon={!release?.windows}
                assetName={release?.windows?.name ?? null}
                assetSize={release?.windows?.size ?? null}
                downloadHref={
                  release?.windows ? `/api/download?platform=windows` : null
                }
              />
            </GridItem>
          </Grid>

          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="lg" p={5}>
            <Heading size="sm" mb={2}>
              Notes on the download
            </Heading>
            <Stack gap={2} color="fg.muted" fontSize="sm">
              <Text>
                Each click generates a fresh, short-lived signed URL — don't share it; just
                come back to this page if it expires.
              </Text>
              <Text>
                Models are bundled inside the installer. First launch is slower because the
                OS verifies the signature.
              </Text>
              <Text>
                Trouble downloading? Visit your{" "}
                <ChakraLink asChild color="brand.300" textDecoration="underline">
                  <Link href="/account">account page</Link>
                </ChakraLink>
                .
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </MarketingShell>
  );
}

function PlatformCard({
  icon,
  label,
  helper,
  comingSoon = false,
  assetName,
  assetSize,
  downloadHref,
}: {
  icon: React.ReactNode;
  label: string;
  helper: string;
  comingSoon?: boolean;
  assetName: string | null;
  assetSize: number | null;
  downloadHref: string | null;
}) {
  const disabled = !downloadHref;
  return (
    <Box
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      p={6}
      bg="bg.subtle"
      h="full"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <HStack gap={3}>
        <Box
          fontSize="3xl"
          p={2}
          borderRadius="md"
          bg="brand.900/40"
          color="brand.300"
        >
          {icon}
        </Box>
        <Stack gap={0}>
          <HStack gap={2} flexWrap="wrap">
            <Heading size="md">{label}</Heading>
            {comingSoon && (
              <Badge colorPalette="brand" variant="subtle" borderRadius="full" fontSize="xs">
                {WINDOWS_COMING_SOON}
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="fg.muted">
            {helper}
          </Text>
        </Stack>
      </HStack>

      <Box
        fontSize="sm"
        color="fg.muted"
        fontFamily="mono"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="md"
        px={3}
        py={2}
        bg="bg"
      >
        {assetName ?? (comingSoon ? "Windows build not available yet" : "No asset published for this platform yet")}
        {assetSize ? <> · {formatBytes(assetSize)}</> : null}
      </Box>

      <Box mt="auto">
        <Button
          asChild={!disabled}
          colorPalette="brand"
          size="lg"
          width="full"
          disabled={disabled}
        >
          {disabled ? (
            <Box>
              <LuDownload style={{ marginRight: 8 }} />{" "}
              {comingSoon ? WINDOWS_COMING_SOON : "Not available"}
            </Box>
          ) : (
            <a href={downloadHref!}>
              <LuDownload style={{ marginRight: 8 }} /> Download {label}
            </a>
          )}
        </Button>
      </Box>
    </Box>
  );
}
