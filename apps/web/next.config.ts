import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
