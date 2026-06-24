import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { BRAND_NAME } from "@/lib/brand";
import { sectionPadding } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign up",
  description: `Create a ${BRAND_NAME} account.`,
};

export default function RegisterPage() {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <AuthPageShell
        title={`Join ${BRAND_NAME}`}
        description="Create a free account to save your files and document history."
      >
        <RegisterForm />
      </AuthPageShell>
    </div>
  );
}
