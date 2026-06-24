import type { NextConfig } from "next";
import { toolShortUrls } from "./src/lib/data/tool-redirects";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  serverExternalPackages: ["pptxgenjs"],
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
