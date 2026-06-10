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
    ];
  },
};

export default nextConfig;
