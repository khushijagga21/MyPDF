import Link from "next/link";
import { FileText, Share2, Globe, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { tools } from "@/lib/data/tools";
import { BRAND_EMAIL, BRAND_NAME } from "@/lib/brand";
import { cn, focusRing } from "@/lib/utils";

const socialLinks = [
  { icon: Share2, label: `Share ${BRAND_NAME}`, href: "#" },
  { icon: Globe, label: "Visit our website", href: "#" },
  { icon: Mail, label: "Email us", href: `mailto:${BRAND_EMAIL}` },
];

const footerLinks = {
  tools: tools.slice(0, 5),
  company: [
    { label: "About", href: "#" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const linkClass = cn(
  "text-sm text-muted-foreground transition-colors hover:text-violet-500 dark:hover:text-violet-400",
  focusRing,
  "rounded-md"
);

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className={cn("inline-flex items-center gap-2.5", focusRing)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                <FileText className="h-5 w-5 text-white" aria-hidden />
              </div>
              <span className="text-xl font-bold">{BRAND_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium PDF tools that work entirely in your browser. Fast, private, and beautifully designed.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20 dark:hover:bg-white/10",
                    focusRing
                  )}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-sm">Popular Tools</h2>
            <ul className="space-y-2.5">
              {footerLinks.tools.map((tool) => (
                <li key={tool.id}>
                  <Link href={tool.href} className={linkClass}>
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-sm">Company</h2>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-sm">Legal</h2>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 sm:my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <p>Made with care for document lovers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
