import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle for Docker / VPS deploys.
  output: "standalone",
  // Keep Prisma out of the bundler; load it as a normal node module at runtime.
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Monorepo root so tracing picks up workspace packages + root node_modules.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/*": ["../node_modules/next/dist/compiled/source-map/**"],
    // Ship the Prisma client + query engine binary into the standalone output.
    "/**": [
      "../node_modules/.prisma/client/**",
      "../node_modules/@prisma/client/**",
      "../node_modules/@prisma/engines/**",
    ],
  },
  async redirects() {
    return [
      {
        source: "/beranda",
        destination: "/home",
        permanent: true,
      },
      {
        source: "/cerita",
        destination: "/inspirasi",
        permanent: true,
      },
      {
        source: "/cerita/:slug",
        destination: "/inspirasi/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
