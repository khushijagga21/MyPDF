"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, focusRing } from "@/lib/utils";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-16 rounded-lg bg-muted/50 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm" asChild>
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 sm:px-3 text-xs sm:text-sm" asChild>
        <Link href="/profile">
          <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Profile</span>
        </Link>
      </Button>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10",
          focusRing
        )}
        aria-label="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
}

/** Session-aware links for the mobile navigation drawer */
export function MobileAuthLinks({
  pathname,
  onNavigate,
  linkClass,
}: {
  pathname: string;
  onNavigate: () => void;
  linkClass: (active: boolean) => string;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <>
        <li>
          <Link href="/profile" onClick={onNavigate} className={linkClass(pathname === "/profile")}>
            My Profile
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              onNavigate();
              void signOut({ callbackUrl: "/" });
            }}
            className={cn(linkClass(false), "w-full text-left")}
          >
            Sign out
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Link href="/login" onClick={onNavigate} className={linkClass(pathname === "/login")}>
          Log in
        </Link>
      </li>
      <li>
        <Link href="/register" onClick={onNavigate} className={linkClass(pathname === "/register")}>
          Sign up
        </Link>
      </li>
    </>
  );
}
