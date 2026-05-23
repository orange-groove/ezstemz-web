import { Box, Button, Container, Flex, HStack, Spacer } from "@chakra-ui/react";
import Link from "next/link";

import { ColorModeButton } from "@/components/ui/color-mode";
import { createClient } from "@/lib/supabase/server";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
];

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      bg="bg/80"
      backdropFilter="blur(12px)"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="6xl" py={3}>
        <Flex align="center" gap={6}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <HStack gap={2}>
              <Box
                w="28px"
                h="28px"
                borderRadius="md"
                bgGradient="linear-gradient(135deg, {colors.brand.400}, {colors.brand.700})"
              />
              <Box fontWeight="bold" letterSpacing="-0.02em" fontSize="lg">
                EZStemz
              </Box>
            </HStack>
          </Link>

          <HStack gap={5} display={{ base: "none", md: "flex" }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{ color: "inherit" }}>
                <Box
                  color="fg.muted"
                  _hover={{ color: "fg" }}
                  fontSize="sm"
                  fontWeight="medium"
                  transition="color 0.15s"
                >
                  {link.label}
                </Box>
              </Link>
            ))}
          </HStack>

          <Spacer />

          <HStack gap={2}>
            <ColorModeButton />
            {user ? (
              <Button asChild size="sm" colorPalette="brand">
                <Link href="/account">Account</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" colorPalette="brand">
                  <Link href="/pricing">Get EZStemz</Link>
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
