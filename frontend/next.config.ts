import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Performance optimizations from Next.js guide
  experimental: {
    // Optimize package imports for better bundling
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot',
    ],
    // Cache Server Components fetch responses during HMR
    serverComponentsHmrCache: true,
  },

  // Disable development indicators (removes Next.js logo in dev)
  devIndicators: false,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Enable detailed fetch logging in development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
