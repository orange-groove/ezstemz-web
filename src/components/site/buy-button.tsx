"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LICENSE_PRICE } from "@/lib/pricing";

type Props = {
  hasLicense: boolean;
  isLoggedIn: boolean;
};

// Pricing-page CTA. Three states:
//  - Already owns it → just sends them to /download.
//  - Logged in, no license → POST /api/checkout, redirect to Stripe.
//  - Logged out → bounce to /login with a return path so they land back on
//    /pricing post-auth and can click again. We don't try to do a
//    "checkout-as-guest" flow because we have to anchor the purchase to a
//    Supabase user_id for license lookup.
export function BuyButton({ hasLicense, isLoggedIn }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (hasLicense) {
    return (
      <Button asChild size="lg" colorPalette="brand">
        <Link href="/download">Download EZStemz</Link>
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <HStack gap={3} flexWrap="wrap">
        <Button asChild size="lg" colorPalette="brand">
          <Link href="/signup?redirectTo=/pricing">Create account &amp; buy</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login?redirectTo=/pricing">Log in</Link>
        </Button>
      </HStack>
    );
  }

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Checkout failed (${res.status})`);
        }
        const { url } = (await res.json()) as { url: string };
        router.push(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not start checkout.";
        setError(message);
      }
    });
  };

  return (
    <HStack gap={3} align="flex-start" flexWrap="wrap">
      <Button onClick={onClick} size="lg" colorPalette="brand" loading={isPending}>
        Buy EZStemz — {LICENSE_PRICE}
      </Button>
      {error && (
        <Text color="red.400" fontSize="sm" maxW="md">
          {error}
        </Text>
      )}
    </HStack>
  );
}
