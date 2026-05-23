import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tree-shake Chakra imports per the upstream docs:
    // https://chakra-ui.com/docs/get-started/frameworks/next-app
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
