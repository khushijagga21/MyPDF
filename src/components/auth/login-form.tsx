"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { BRAND_NAME } from "@/lib/brand";
import { AuthFormPanel } from "@/components/auth/auth-page-shell";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered") === "1";
  const required = searchParams.get("required") === "1" || Boolean(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password."
          : "Could not sign in. Please try again."
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <AuthFormPanel
      heading="Sign in"
      subheading="Access your profile and document history"
    >
      {registered && (
        <p className="mb-4 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm text-center px-3 py-2">
          Account created! Sign in below.
        </p>
      )}
      {required && !registered && (
        <p className="mb-4 rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-400 text-sm text-center px-3 py-2">
          Sign in to use {BRAND_NAME} tools.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        )}
        <LoadingButton
          type="submit"
          className="w-full"
          loading={loading}
          loadingText="Signing in..."
        >
          Sign in
        </LoadingButton>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-violet-600 hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthFormPanel>
  );
}
