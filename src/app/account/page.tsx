import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MarketingShell } from "@/components/site/marketing-shell";
import { getLicenseStatus } from "@/lib/license";
import { LICENSE_PRICE } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt and braces — middleware already redirects unauthenticated users, but
  // this stops the page from rendering a half-broken state if the middleware
  // matcher is ever loosened.
  if (!user) redirect("/login?redirectTo=/account");

  const license = await getLicenseStatus(user.id);
  const formattedPurchaseDate = license.purchasedAt
    ? new Date(license.purchasedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <MarketingShell>
      <Container maxW="4xl" py={{ base: 14, md: 20 }}>
        <Stack gap={8}>
          <Stack gap={1}>
            <Heading size="3xl">Your account</Heading>
            <Text color="fg.muted">Signed in as {user.email}</Text>
          </Stack>

          <Box
            borderWidth="1px"
            borderColor={license.hasLicense ? "brand.500" : "border.subtle"}
            borderRadius="xl"
            p={6}
            bg="bg.subtle"
          >
            <HStack justify="space-between" flexWrap="wrap" gap={4} align="flex-start">
              <Stack gap={2}>
                <HStack gap={3}>
                  <Heading size="lg">EZStemz Desktop</Heading>
                  {license.hasLicense ? (
                    <Badge colorPalette="green" variant="subtle">
                      Licensed
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray" variant="subtle">
                      Not purchased
                    </Badge>
                  )}
                </HStack>
                <Text color="fg.muted">
                  {license.hasLicense
                    ? `Purchased on ${formattedPurchaseDate}. Download as many times as you need.`
                    : "Buy once, re-download on any of your computers."}
                </Text>
              </Stack>
              <Box>
                {license.hasLicense ? (
                  <Button asChild colorPalette="brand" size="lg">
                    <Link href="/download">Download</Link>
                  </Button>
                ) : (
                  <Button asChild colorPalette="brand" size="lg">
                    <Link href="/pricing">Buy — {LICENSE_PRICE}</Link>
                  </Button>
                )}
              </Box>
            </HStack>
          </Box>

          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="xl" p={6}>
            <Heading size="md" mb={3}>
              Need help?
            </Heading>
            <Text color="fg.muted" mb={4}>
              Email{" "}
              <ChakraLink href="mailto:hello@ezstemz.com" color="brand.300">
                hello@ezstemz.com
              </ChakraLink>{" "}
              for refunds, missing license, or anything else. We answer same-day on weekdays.
            </Text>
            <form action="/logout" method="post">
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </Box>
        </Stack>
      </Container>
    </MarketingShell>
  );
}
