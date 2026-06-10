import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/**": ["../../node_modules/next/dist/compiled/source-map/**"],
  },
};

export default nextConfig;
