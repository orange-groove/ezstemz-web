import {
  Badge,
  Box,
  Container,
  Heading,
  HStack,
  Link as ChakraLink,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Metadata } from "next";
import { LuCheck } from "react-icons/lu";

import { BuyButton } from "@/components/site/buy-button";
import { MarketingShell } from "@/components/site/marketing-shell";
import { getLicenseStatus } from "@/lib/license";
import { LICENSE_PRICE } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${LICENSE_PRICE} one-time. Lifetime downloads. macOS + Windows.`,
};

const INCLUDED = [
  "macOS and Windows apps",
  "Lifetime updates",
  "6-stem separation (drums, bass, vocals, guitar, piano, other)",
  "Built-in mixer + 44.1 kHz WAV export",
  "Use on all of your personal computers",
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const status = user ? await getLicenseStatus(user.id) : null;

  return (
    <MarketingShell>
      <Container maxW="3xl" py={{ base: 16, md: 24 }}>
        <Stack gap={3} textAlign="center" mb={10}>
          <Heading size={{ base: "3xl", md: "4xl" }} letterSpacing="-0.03em">
            {LICENSE_PRICE}, once.
          </Heading>
          <Text color="fg.muted" fontSize="lg" maxW="xl" mx="auto">
            A desktop app — not a subscription. Pay once, download anytime, run offline forever.
          </Text>
        </Stack>

        <Box
          borderWidth="1px"
          borderColor="brand.500"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          bg="bg.subtle"
        >
          <Stack gap={6}>
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
              <Stack gap={1}>
                <Badge colorPalette="brand" variant="subtle" alignSelf="flex-start" borderRadius="full">
                  Lifetime license
                </Badge>
                <Heading size="xl">EZStemz</Heading>
              </Stack>
              <HStack alignItems="baseline" gap={1}>
                <Heading size="4xl" letterSpacing="-0.04em">
                  {LICENSE_PRICE}
                </Heading>
                <Text color="fg.muted">USD</Text>
              </HStack>
            </HStack>

            <List.Root gap={2} variant="plain">
              {INCLUDED.map((item) => (
                <List.Item key={item}>
                  <HStack gap={3} align="flex-start">
                    <Box color="brand.300" mt={1} flexShrink={0}>
                      <LuCheck />
                    </Box>
                    <Text>{item}</Text>
                  </HStack>
                </List.Item>
              ))}
            </List.Root>

            <BuyButton hasLicense={status?.hasLicense ?? false} isLoggedIn={Boolean(user)} />

            <Text fontSize="sm" color="fg.muted">
              Account required for download access. 14-day refund if it doesn&apos;t work on your
              machine —{" "}
              <ChakraLink href="mailto:hello@ezstemz.com" color="brand.300">
                hello@ezstemz.com
              </ChakraLink>
              .
            </Text>
          </Stack>
        </Box>

        <Text color="fg.muted" fontSize="sm" textAlign="center" mt={8}>
          More questions? See the{" "}
          <ChakraLink href="/#faq" color="brand.300">
            FAQ
          </ChakraLink>
          .
        </Text>
      </Container>
    </MarketingShell>
  );
}
