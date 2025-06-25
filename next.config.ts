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
  experimental: {
    optimizePackageImports: ['lucide-react', '@prisma/client']
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Exclude heavy server-only packages from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('@prisma/client', 'bcryptjs', 'jsonwebtoken');
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
