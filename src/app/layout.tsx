import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppProviders } from "@/components/providers/app-providers";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { GradientBackground } from "@/components/layout/gradient-background";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Merge, split, compress, and convert PDFs with a beautiful browser-based experience. Fast, private, and free to start.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            <NavigationProgress />
            <GradientBackground />
          <Header />
          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
