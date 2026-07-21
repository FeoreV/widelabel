import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Produces a minimal self-contained server bundle for Docker production images.
  // The standalone output is used in apps/storefront/Dockerfile (production stage).
  output: "standalone",
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
