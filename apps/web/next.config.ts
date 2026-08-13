import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle for Docker / VPS deploys.
  output: "standalone",
  // Monorepo root so tracing picks up workspace packages + root node_modules.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/*": ["../node_modules/next/dist/compiled/source-map/**"],
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
