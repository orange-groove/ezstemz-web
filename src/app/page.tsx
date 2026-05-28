import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { LuLock, LuSlidersHorizontal, LuSparkles } from "react-icons/lu";

import { FaqSchema } from "@/components/seo/site-schemas";
import { MarketingShell } from "@/components/site/marketing-shell";
import { LICENSE_PRICE } from "@/lib/pricing";
import { PLATFORMS_SHORT, PLATFORMS_TAGLINE } from "@/lib/platforms";
import { sharedOpenGraph, sharedTwitter, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

const HOME_TITLE = `${SITE_NAME} — AI stem separator (local, offline)`;
const HOME_DESCRIPTION =
  "Split any song into drums, bass, vocals, guitar, piano, and other stems on your Mac or PC. " +
  "Local AI stem separation — no cloud upload, no subscription.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: sharedOpenGraph(HOME_TITLE, HOME_DESCRIPTION),
  twitter: sharedTwitter(HOME_TITLE, HOME_DESCRIPTION),
};

const FEATURES = [
  {
    icon: LuLock,
    title: "100% local",
    body:
      "Separation runs on your CPU — audio is never uploaded for processing. The desktop app works offline. " +
      "Create a free account here only to buy your license and download installers.",
  },
  {
    icon: LuSparkles,
    title: "6-stem model",
    body:
      "Drums, bass, vocals, guitar, piano, and other",
  },
  {
    icon: LuSlidersHorizontal,
    title: "Mix and export",
    body:
      "Mute, solo, and gain per stem. Export 44.1 kHz WAVs to your DAW or mix in the app using plugins.",
  },
];

const FAQ = [
  {
    q: "Does this need an internet connection?",
    a: "Only once, to download the app and the bundled separation model. After that it runs entirely offline.",
  },
  {
    q: "Will my GPU make it faster?",
    a: "Not yet. Everything runs on the CPU today. Apple Silicon is fastest; Intel and Windows take a bit longer.",
  },
  {
    q: "Which formats can I drop in?",
    a: "MP3, WAV, FLAC, AIFF, OGG, plus M4A on macOS. Output is always 44.1 kHz stereo WAV.",
  },
  {
    q: "Is there a free trial?",
    a: "There's a single one-time purchase that includes lifetime updates and re-downloads on any of your machines. No subscription.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes — if the app doesn't work on your machine, email hello@ezstemz.com within 14 days and we'll refund in full.",
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <FaqSchema entries={FAQ} />
      <Box
        position="relative"
        overflow="hidden"
        borderBottomWidth="1px"
        borderColor="border.subtle"
      >
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear-gradient(135deg, {colors.brand.900}, transparent 60%)"
          opacity={0.55}
          pointerEvents="none"
        />
        <Container maxW="6xl" py={{ base: 16, md: 28 }} position="relative">
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1.15fr" }}
            gap={{ base: 10, lg: 12 }}
            alignItems="center"
          >
            <Stack gap={6}>
            
            <Heading
              as="h1"
              size={{ base: "3xl", md: "5xl" }}
              lineHeight="1.05"
              letterSpacing="-0.03em"
            >
              Split any song into clean stems —{" "}
              <Box
                as="span"
                bgGradient="linear-gradient(135deg, {colors.brand.300}, {colors.brand.600})"
                bgClip="text"
              >
                on your own machine.
              </Box>
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="fg.muted">
              Drop in MP3, WAV, FLAC, AIFF, OGG, or M4A (macOS). Get drums, bass, vocals,
              guitar, piano, and "other" as separate 44.1&nbsp;kHz WAVs in a few minutes. No
              cloud upload, no recurring fee.
            </Text>
            <HStack gap={3} pt={2} flexWrap="wrap">
              <Button asChild size="lg" colorPalette="brand">
                <Link href="/pricing">Get EZStemz — {LICENSE_PRICE}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">See how it works</Link>
              </Button>
            </HStack>
            <HStack gap={6} pt={4} color="fg.muted" fontSize="sm" flexWrap="wrap">
              <HStack gap={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
                <Text>One-time purchase</Text>
              </HStack>
              <HStack gap={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
                <Text>{PLATFORMS_SHORT}</Text>
              </HStack>
              <HStack gap={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
                <Text>14-day refund</Text>
              </HStack>
            </HStack>
            </Stack>

            <Box position="relative">
              <Box
                position="absolute"
                inset={{ base: "8%", md: "6%" }}
                borderRadius="2xl"
                bg="brand.500"
                opacity={0.2}
                filter="blur(48px)"
                pointerEvents="none"
              />
              <Box
                position="relative"
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="xl"
                overflow="hidden"
                bg="bg.subtle"
                boxShadow="0 24px 80px rgba(0, 0, 0, 0.45)"
              >
                <Image
                  src="/screenshot.png"
                  alt="EZStemz showing six stem tracks with waveforms and a mixer window"
                  width={3438}
                  height={1910}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: 16, md: 24 }} id="features">
        <Stack gap={3} mb={12} maxW="2xl">
          <Text
            color="brand.400"
            fontWeight="semibold"
            fontSize="sm"
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            Why EZStemz
          </Text>
          <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
            Everything runs on your machine.
          </Heading>
        </Stack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          {FEATURES.map((feature) => (
            <GridItem key={feature.title}>
              <Box
                p={6}
                borderWidth="1px"
                borderColor="border.subtle"
                borderRadius="xl"
                h="full"
                bg="bg.subtle"
                _hover={{ borderColor: "brand.500" }}
                transition="border-color 0.15s"
              >
                <HStack mb={4} gap={3}>
                  <Box
                    p={2}
                    borderRadius="md"
                    bg="brand.900/40"
                    color="brand.300"
                    fontSize="xl"
                  >
                    <feature.icon />
                  </Box>
                  <Heading size="md">{feature.title}</Heading>
                </HStack>
                <Text color="fg.muted">{feature.body}</Text>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Container>

      <Box
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="border.subtle"
        bg="bg.subtle/40"
      >
        <Container maxW="6xl" py={{ base: 16, md: 24 }}>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1.2fr" }}
            gap={{ base: 8, md: 14 }}
            alignItems="center"
          >
            <Stack gap={4}>
              <Text
                color="brand.400"
                fontWeight="semibold"
                fontSize="sm"
                letterSpacing="0.1em"
                textTransform="uppercase"
              >
                The workflow
              </Text>
              <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
                Drag, wait, mix.
              </Heading>
              <Text color="fg.muted" fontSize="lg">
                You don't pick a model, you don't set parameters, you don't reach for the
                terminal. Drop a file, watch a progress bar, then drive a transport like any
                other DAW.
              </Text>
            </Stack>

            <Stack gap={5}>
              {[
                {
                  step: "01",
                  title: "Drop in your audio",
                  body: "MP3, WAV, FLAC, AIFF, OGG, plus M4A on macOS.",
                },
                {
                  step: "02",
                  title: "EZStemz separates the stems",
                  body: "About 2–5 minutes for a 3-minute song on Apple Silicon. Longer on Intel.",
                },
                {
                  step: "03",
                  title: "Mix the stems live",
                  body:
                    "Per-track gain, mute, solo, scrubable transport, master gain. WAVs sit in your app-support folder for later.",
                },
              ].map((step) => (
                <HStack
                  key={step.step}
                  align="flex-start"
                  gap={4}
                  p={4}
                  borderWidth="1px"
                  borderColor="border.subtle"
                  borderRadius="lg"
                  bg="bg"
                >
                  <Box
                    fontFamily="mono"
                    fontSize="sm"
                    color="brand.400"
                    pt={1}
                    minW="3ch"
                  >
                    {step.step}
                  </Box>
                  <Box>
                    <Heading size="sm" mb={1}>
                      {step.title}
                    </Heading>
                    <Text color="fg.muted" fontSize="sm">
                      {step.body}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </Stack>
          </Grid>
        </Container>
      </Box>

      <Container maxW="3xl" py={{ base: 16, md: 24 }} id="faq">
        <Stack gap={3} mb={10}>
          <Text
            color="brand.400"
            fontWeight="semibold"
            fontSize="sm"
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            FAQ
          </Text>
          <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
            Questions before you buy.
          </Heading>
        </Stack>

        <Stack gap={4}>
          {FAQ.map((entry) => (
            <Box
              key={entry.q}
              borderWidth="1px"
              borderColor="border.subtle"
              borderRadius="lg"
              p={5}
            >
              <Heading size="sm" mb={2}>
                {entry.q}
              </Heading>
              <Text color="fg.muted">{entry.a}</Text>
            </Box>
          ))}
        </Stack>
      </Container>

      <Box bg="brand.900/30" borderTopWidth="1px" borderColor="border.subtle">
        <Container maxW="4xl" py={{ base: 14, md: 20 }} textAlign="center">
          <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em" mb={4}>
            Ready to break a song apart?
          </Heading>
          <Text color="fg.muted" fontSize="lg" mb={6}>
            One purchase, lifetime updates, runs forever offline.
          </Text>
          <Button asChild size="lg" colorPalette="brand">
            <Link href="/pricing">Buy EZStemz — {LICENSE_PRICE}</Link>
          </Button>
        </Container>
      </Box>
    </MarketingShell>
  );
}
