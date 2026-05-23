import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to download EZStemz or manage your license."
      footer={{ label: "No account yet?", href: "/signup", cta: "Create one →" }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
