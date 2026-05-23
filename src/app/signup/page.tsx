import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your EZStemz account"
      subtitle="Used to anchor your license so you can re-download on any machine."
      footer={{ label: "Already have one?", href: "/login", cta: "Log in →" }}
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
