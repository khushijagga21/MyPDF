import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/brand";
import { availableTools } from "@/lib/data/tools";
import { toolShortUrls } from "@/lib/data/tool-redirects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages = ["", "/pricing", "/contact", "/login", "/register"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  const toolPages = availableTools.map((tool) => ({
    url: `${base}${tool.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const shortUrls = toolShortUrls
    .filter((r) => r.source !== r.destination)
    .map((r) => ({
      url: `${base}${r.source}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));

  return [...staticPages, ...toolPages, ...shortUrls];
}
