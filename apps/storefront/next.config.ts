import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Produces a minimal self-contained server bundle for Docker production images.
  // The standalone output is used in apps/storefront/Dockerfile (production stage).
  output: "standalone",
};

export default nextConfig;
