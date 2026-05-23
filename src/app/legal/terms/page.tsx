import { Container, Heading, Stack, Text } from "@chakra-ui/react";
import type { Metadata } from "next";

import { MarketingShell } from "@/components/site/marketing-shell";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <MarketingShell>
      <Container maxW="3xl" py={{ base: 16, md: 24 }}>
        <Stack gap={6}>
          <Heading size="3xl">Terms of service</Heading>
          <Text color="fg.muted">
            Placeholder. Replace this page with your real terms before launch. The recommended
            template covers: license grant (personal, non-transferable, lifetime),
            permitted/forbidden use, refund window, governing law, contact email.
          </Text>
        </Stack>
      </Container>
    </MarketingShell>
  );
}
