"use client";

import {
  Alert,
  Box,
  Button,
  Field,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Supabase will email a magic link to this URL. The route handler
        // exchanges the code, sets cookies, then forwards to redirectTo.
        emailRedirectTo: `${window.location.origin}/auth/confirm?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    // Supabase returns a session immediately ONLY if email confirmation is
    // disabled in the project's Auth settings. With confirmation on (the
    // default), the user gets an email + we keep them on the page.
    if (data.session) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setNeedsConfirm(true);
    setSubmitting(false);
  };

  if (needsConfirm) {
    return (
      <Stack gap={4} textAlign="center">
        <Box fontSize="3xl" lineHeight="1">
          📬
        </Box>
        <Text fontWeight="medium">Check your inbox</Text>
        <Text color="fg.muted">
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish creating
          your account.
        </Text>
      </Stack>
    );
  }

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
          <Field.Label>Password</Field.Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
          />
          <Field.HelperText>At least 8 characters.</Field.HelperText>
        </Field.Root>

        <Button type="submit" colorPalette="brand" loading={isSubmitting} size="lg">
          Create account
        </Button>
      </Stack>
    </form>
  );
}
