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
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One-time purchase. Lifetime downloads. macOS + Windows.",
};

const INCLUDED = [
  "macOS (Apple Silicon + Intel) and Windows builds",
  "Lifetime app updates",
  "6-stem htdemucs separation model bundled inside the app",
  "Sample-accurate multitrack mixer",
  "Stems exported as 44.1 kHz WAV",
  "Signed + notarized for both platforms",
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
      <Container maxW="4xl" py={{ base: 16, md: 24 }}>
        <Stack gap={3} textAlign="center" mb={12}>
          <Text
            color="brand.400"
            fontWeight="semibold"
            fontSize="sm"
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            Pricing
          </Text>
          <Heading size={{ base: "3xl", md: "4xl" }} letterSpacing="-0.03em">
            One price. One purchase. Forever.
          </Heading>
          <Text color="fg.muted" fontSize="lg" maxW="2xl" mx="auto">
            EZStemz is a desktop app, not a SaaS. Buy it once and it keeps working — even when
            this website is gone, even when you're offline, even when we ship our 30th update.
          </Text>
        </Stack>

        <Box
          position="relative"
          borderWidth="1px"
          borderColor="brand.500"
          borderRadius="2xl"
          p={{ base: 8, md: 10 }}
          bg="bg.subtle"
          overflow="hidden"
        >
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear-gradient(135deg, {colors.brand.900}, transparent 60%)"
            opacity={0.35}
            pointerEvents="none"
          />
          <Stack gap={6} position="relative">
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
              <Stack gap={1}>
                <Badge
                  colorPalette="brand"
                  variant="subtle"
                  alignSelf="flex-start"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  EZStemz · Lifetime
                </Badge>
                <Heading size="2xl">EZStemz Desktop</Heading>
                <Text color="fg.muted">Everything you need to crack open a track at home.</Text>
              </Stack>
              <Stack gap={0} alignItems="flex-end">
                <HStack alignItems="baseline">
                  <Heading size="4xl" letterSpacing="-0.04em">
                    $39
                  </Heading>
                  <Text color="fg.muted">USD</Text>
                </HStack>
                <Text color="fg.muted" fontSize="sm">
                  one-time · billed via Stripe
                </Text>
              </Stack>
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

            <Box pt={2}>
              <BuyButton hasLicense={status?.hasLicense ?? false} isLoggedIn={Boolean(user)} />
            </Box>
            <Text fontSize="sm" color="fg.muted">
              Buying creates an account tied to your email so you can re-download from any
              computer. Refundable within 14 days, no questions asked.
            </Text>
          </Stack>
        </Box>

        <Stack gap={4} mt={14}>
          <Heading size="lg">Other questions</Heading>
          <Text color="fg.muted">
            See the{" "}
            <ChakraLink href="/#faq" color="brand.300">
              FAQ on the home page
            </ChakraLink>{" "}
            or email{" "}
            <ChakraLink href="mailto:hello@ezstemz.com" color="brand.300">
              hello@ezstemz.com
            </ChakraLink>
            .
          </Text>
        </Stack>
      </Container>
    </MarketingShell>
  );
}
