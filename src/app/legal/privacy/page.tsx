import { Container, Heading, Stack, Text } from "@chakra-ui/react";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/site/marketing-shell";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <Container maxW="3xl" py={{ base: 16, md: 24 }}>
        <Stack gap={6}>
          <Heading size="3xl">Privacy policy</Heading>
          <Text color="fg.muted">
            Placeholder. The desktop app processes audio entirely locally — no audio data
            leaves your machine. The website stores: your email + Supabase auth metadata, and a
            Stripe customer ID + purchase record for license verification. Replace this page
            with the proper policy text before launch.
          </Text>
        </Stack>
      </Container>
    </MarketingShell>
  );
}
