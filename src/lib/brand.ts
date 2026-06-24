export const BRAND_NAME = "MyPDF";
export const BRAND_TAGLINE = "Premium PDF Tools";
export const BRAND_EMAIL = "hello@mypdf.app";

/** Public site URL for SEO, sitemap, and auth. Set SITE_URL in production. */
export function getSiteUrl(): string {
  const url =
    process.env.SITE_URL ??
    process.env.AUTH_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.startsWith("http")) return trimmed;
  return `https://${trimmed}`;
}
