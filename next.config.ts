import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/((?!api/).*)',
        destination: '/static-app-shell',
      },
    ];
  },
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
