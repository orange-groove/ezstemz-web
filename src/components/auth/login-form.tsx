"use client";

import {
  Alert,
  Button,
  Field,
  Input,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    // The middleware has already written fresh cookies via setAll(); a full
    // navigation refresh ensures every Server Component re-reads them.
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack gap={4}>
        {error && (
          <Alert.Root status="error" variant="subtle">
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        <Field.Root required>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>
            Password
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Field.HelperText>
            <Link href="/auth/reset" style={{ color: "var(--chakra-colors-brand-300)" }}>
              Forgot your password?
            </Link>
          </Field.HelperText>
        </Field.Root>

        <Button type="submit" colorPalette="brand" loading={isSubmitting} size="lg">
          Log in
        </Button>
      </Stack>
    </form>
  );
}
