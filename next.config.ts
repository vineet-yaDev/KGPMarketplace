// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Performance optimizations for production
  experimental: {
    optimizePackageImports: ['lucide-react', '@next/font'],
  },
  // Enable static generation and caching
  generateBuildId: async () => {
    return 'kgp-marketplace-' + new Date().getTime()
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
