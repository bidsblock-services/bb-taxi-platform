import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_STATIC === 'true' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  distDir: 'dist',
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://bb-platform.pages.dev' 
      : 'http://localhost:3000'
  }
};

export default nextConfig;
