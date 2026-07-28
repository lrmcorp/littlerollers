import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  output: 'standalone',
  devIndicators: false,
  transpilePackages: ['@dailydose/api-client-ts'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_BASE_URL ?? 'http://127.0.0.1:32121'}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/check-in-pass',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ];
  },
};
export default config;
