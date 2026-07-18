import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@dailydose/api-client-ts'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_BASE_URL ?? 'http://127.0.0.1:3001'}/api/v1/:path*`,
      },
    ];
  },
};
export default config;
