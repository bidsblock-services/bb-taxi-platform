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
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://bb-platform.pages.dev' 
      : 'http://localhost:3000'
  }
};

export default nextConfig;
