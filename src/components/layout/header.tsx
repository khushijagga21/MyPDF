"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ToolsDropdown } from "@/components/layout/tools-dropdown";
import { AuthNav, MobileAuthLinks } from "@/components/auth/auth-nav";
import { availableTools } from "@/lib/data/tools";
import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { cn, focusRing, navLinkClass } from "@/lib/utils";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const closeMenu = useCallback(() => {
    setMobileOpen(false);
    setMobileToolsOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMenu]);

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-3 flex h-14 sm:h-16 items-center justify-between gap-3 rounded-2xl border border-white/20 bg-surface px-4 sm:px-6 backdrop-blur-xl dark:border-white/10 shadow-lg shadow-black/5">
          <Link
            href="/"
            className={cn("flex min-w-0 items-center gap-2 sm:gap-2.5 group shrink-0", focusRing)}
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105 group-focus-visible:scale-105">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent truncate">
              {BRAND_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              href="/"
              className={navLinkClass(pathname === "/")}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Home
            </Link>
            <ToolsDropdown />
            {mainLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(pathname === link.href)}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AuthNav />
            <Button variant="default" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/merge-pdf">Get Started</Link>
            </Button>
            <Button
              ref={toggleRef}
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={closeMenu}
              {...(shouldReduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
            />
            <motion.div
              ref={menuRef}
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed inset-x-4 top-[4.5rem] z-50 rounded-2xl border border-white/20 bg-surface-elevated p-3 shadow-2xl md:hidden max-h-[calc(100dvh-5.5rem)] overflow-y-auto"
              {...motionProps}
            >
              <nav aria-label="Mobile navigation">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/"
                      onClick={closeMenu}
                      className={cn(navLinkClass(pathname === "/"), "block")}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setMobileToolsOpen((o) => !o)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium",
                        focusRing,
                        mobileToolsOpen
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "text-muted-foreground"
                      )}
                    >
                      Tools
                      <span className="text-xs">{mobileToolsOpen ? "▲" : "▼"}</span>
                    </button>
                    {mobileToolsOpen && (
                      <ul className="mt-1 ml-2 space-y-0.5 border-l border-white/10 pl-3">
                        {availableTools.map((tool) => (
                          <li key={tool.id}>
                            <Link
                              href={tool.href}
                              onClick={closeMenu}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm",
                                pathname === tool.href
                                  ? "text-violet-600 dark:text-violet-400 font-medium"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {tool.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href="/#tools"
                            onClick={closeMenu}
                            className="block rounded-lg px-3 py-2 text-xs text-violet-500 font-medium"
                          >
                            All tools →
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                  {mainLinks.slice(1).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={cn(navLinkClass(pathname === link.href), "block")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <MobileAuthLinks
                    pathname={pathname}
                    onNavigate={closeMenu}
                    linkClass={(active) =>
                      cn(navLinkClass(active), "block w-full text-left")
                    }
                  />
                </ul>
              </nav>
              <div className="mt-3 border-t border-white/10 pt-3">
                <Button className="w-full" asChild>
                  <Link href="/merge-pdf" onClick={closeMenu}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
