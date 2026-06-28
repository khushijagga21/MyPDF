import type { NextConfig } from "next";

const toolShortUrls = [
  { source: "/merge", destination: "/merge-pdf" },
  { source: "/split", destination: "/split-pdf" },
  { source: "/compress", destination: "/compress-pdf" },
  { source: "/edit", destination: "/edit-pdf" },
  { source: "/remove-pages", destination: "/remove-pdf-pages" },
  { source: "/pdf-to-word", destination: "/pdf-to-word" },
  { source: "/pdf-to-excel", destination: "/pdf-to-excel" },
  { source: "/pdf-to-powerpoint", destination: "/pdf-to-powerpoint" },
  { source: "/pdf-to-jpg", destination: "/pdf-to-jpg" },
  { source: "/word-to-pdf", destination: "/word-to-pdf" },
  { source: "/excel-to-pdf", destination: "/excel-to-pdf" },
  { source: "/jpg-to-pdf", destination: "/jpg-to-pdf" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["pdfjs-dist"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  serverExternalPackages: [
    "pptxgenjs",
    "docx",
    "mammoth",
    "xlsx",
    "dommatrix",
    "pdfjs-dist",
  ],
  async redirects() {
    return toolShortUrls
      .filter(({ source, destination }) => source !== destination)
      .map(({ source, destination }) => ({
        source,
        destination,
        permanent: true,
      }));
  },
};

export default nextConfig;
