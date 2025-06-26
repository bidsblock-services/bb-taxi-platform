import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed static export - Cloudflare Pages will handle API routes as Functions
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'dist',
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@prisma/client']
  },
  // Exclude cache files from build output for Cloudflare Pages size limits
  webpack: (config, { isServer }) => {
    // Disable webpack cache for production builds to avoid large cache files
    if (process.env.NODE_ENV === 'production') {
      config.cache = false;
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://bb-platform.pages.dev' 
      : 'http://localhost:3000'
  }
};

export default nextConfig;
