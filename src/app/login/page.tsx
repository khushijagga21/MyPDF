import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { BRAND_NAME } from "@/lib/brand";
import { sectionPadding } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Log in",
  description: `Sign in to your ${BRAND_NAME} account.`,
};

export default function LoginPage() {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <AuthPageShell
        title="Welcome back"
        description={`Sign in to use ${BRAND_NAME} tools and access your documents.`}
      >
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthPageShell>
    </div>
  );
}
