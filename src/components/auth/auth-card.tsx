import { Box, Container, Heading, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  footer: { label: string; href: string; cta: string };
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <Container maxW="md" py={{ base: 10, md: 16 }}>
      <Stack gap={2} mb={8} textAlign="center">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Box
            display="inline-block"
            fontWeight="bold"
            fontSize="lg"
            letterSpacing="-0.02em"
          >
            EZStemz
          </Box>
        </Link>
        <Heading size="2xl" mt={2}>
          {title}
        </Heading>
        <Text color="fg.muted">{subtitle}</Text>
      </Stack>

      <Box
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="xl"
        p={6}
        bg="bg.subtle"
      >
        {children}
      </Box>

      <Text textAlign="center" mt={6} color="fg.muted" fontSize="sm">
        {footer.label}{" "}
        <ChakraLink asChild color="brand.300" fontWeight="medium">
          <Link href={footer.href}>{footer.cta}</Link>
        </ChakraLink>
      </Text>
    </Container>
  );
}
