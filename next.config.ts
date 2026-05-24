import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression for faster delivery
  compress: true,

  // Image optimization
  images: {
    unoptimized: true,
  },

  // Turbopack configuration (Next.js 16 default)
  turbopack: {},

  // Headers for cache control
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },

  // Redirects for performance (no 404s)
  async redirects() {
    return [];
  },

  // Rewrites to optimize routing
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
    };
  },

  // Experimental features for better performance
  experimental: {
    serverMinification: true,
  },
};

export default nextConfig;
