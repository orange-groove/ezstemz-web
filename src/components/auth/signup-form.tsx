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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  authRedirectMetadata,
  CUSTOM_SMTP_REQUIRED_MESSAGE,
  getAuthConfirmUrl,
  isEmailNotAuthorizedError,
  isEmailRateLimitError,
  isExistingAccountSignup,
} from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

function formatSignUpError(code: string | undefined, message: string): string {
  if (isEmailNotAuthorizedError(code, message)) {
    return CUSTOM_SMTP_REQUIRED_MESSAGE;
  }
  if (isEmailRateLimitError(message)) {
    return (
      "Supabase's built-in email is rate-limited (~2/hour). Wait and retry, or configure custom SMTP " +
      "(Authentication → SMTP) so real users can sign up."
    );
  }
  return message;
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [isResending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const signUpOptions = () => ({
    emailRedirectTo: getAuthConfirmUrl(),
    data: authRedirectMetadata(redirectTo),
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResendMessage(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions(),
    });

    if (signUpError) {
      setError(formatSignUpError(signUpError.code, signUpError.message));
      setSubmitting(false);
      return;
    }

    if (isExistingAccountSignup(data.user)) {
      setError(
        "An account with this email already exists. Log in instead, or check your inbox for an earlier confirmation link.",
      );
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

  const onResend = async () => {
    setResending(true);
    setError(null);
    setResendMessage(null);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: signUpOptions(),
    });

    if (resendError) {
      setError(formatSignUpError(resendError.code, resendError.message));
    } else {
      setResendMessage("Confirmation email sent again. Check your inbox and spam folder.");
    }

    setResending(false);
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
        <Text color="fg.muted" fontSize="sm">
          Nothing after a few minutes? Check spam. If you&apos;re not using custom SMTP, Supabase only
          sends to emails on your org&apos;s team — everyone else never gets mail even though signup
          looks successful. Enable SMTP under Authentication → SMTP (Resend takes ~5 minutes).
        </Text>

        {error && (
          <Alert.Root status="error" variant="subtle">
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        {resendMessage && (
          <Alert.Root status="success" variant="subtle">
            <Alert.Indicator />
            <Alert.Title>{resendMessage}</Alert.Title>
          </Alert.Root>
        )}

        <Button onClick={onResend} variant="outline" loading={isResending}>
          Resend confirmation email
        </Button>
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
